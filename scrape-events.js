const fs = require('fs');
const path = require('path');

// Helper to sleep between requests to avoid rate limits
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to fetch page content using Node's built-in fetch
async function fetchPage(pageNumber) {
    const url = pageNumber === 0 
        ? 'https://www.uwindsor.ca/registrar/events-listing'
        : `https://www.uwindsor.ca/registrar/events-listing?page=${pageNumber}`;
    
    console.log(`Fetching page ${pageNumber}: ${url}`);
    
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status} for page ${pageNumber}`);
            return null;
        }
        
        return await response.text();
    } catch (e) {
        console.error(`Error fetching page ${pageNumber}:`, e.message);
        return null;
    }
}

// Extract events from HTML string
function parseEvents(html) {
    const events = [];
    
    // Split into table rows (<tr>)
    const rowSplits = html.split(/<tr\b[^>]*>/i);
    // The first split is before the first <tr>, skip it
    for (let i = 1; i < rowSplits.length; i++) {
        const row = rowSplits[i].split(/<\/tr>/i)[0];
        
        // Check if this is an event row (contains views-field-title)
        if (!row.includes('views-field-title')) continue;
        
        // 1. Extract link and title
        // Example: <td class="views-field views-field-title"><a href="/registrar/...">Title Text</a></td>
        const titleMatch = row.match(/<td\s+class="[^"]*views-field-title[^"]*">\s*<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
        if (!titleMatch) continue;
        
        let url = titleMatch[1].trim();
        if (url.startsWith('/')) {
            url = 'https://www.uwindsor.ca' + url;
        }
        
        // Clean title (remove html entities, whitespace)
        let title = titleMatch[2].trim()
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&rsquo;/g, "'")
            .replace(/&ndash;/g, '-')
            .replace(/&mdash;/g, '-')
            .replace(/\s+/g, ' ');
            
        // 2. Extract Dates
        let startDate = null;
        let endDate = null;
        let dateText = '';
        
        // Check for range date display start/end
        const startMatch = row.match(/class="date-display-start"[^>]*content="([^"]+)"/i);
        const endMatch = row.match(/class="date-display-end"[^>]*content="([^"]+)"/i);
        
        if (startMatch && endMatch) {
            startDate = startMatch[1].split('T')[0];
            endDate = endMatch[1].split('T')[0];
        } else {
            // Check for single date
            const singleMatch = row.match(/class="date-display-single"[^>]*content="([^"]+)"/i);
            if (singleMatch) {
                startDate = singleMatch[1].split('T')[0];
                endDate = startDate; // Same day
            }
        }
        
        // Extract raw date text as backup/display
        // Inside date cell: <td class="...event-listing-date">...text...</td>
        const dateCellMatch = row.match(/<td\s+class="[^"]*event-listing-date[^"]*">([\s\S]*?)<\/td>/i);
        if (dateCellMatch) {
            dateText = dateCellMatch[1].trim()
                .replace(/<[^>]+>/g, '') // remove HTML tags
                .replace(/\s+/g, ' ');
        }
        
        if (startDate) {
            events.push({
                title,
                url,
                startDate,
                endDate,
                dateText
            });
        }
    }
    
    return events;
}

async function scrapeAll() {
    console.log('Starting UWindsor Academic Dates scrape...');
    let allEvents = [];
    let page = 0;
    let emptyPagesCount = 0;
    
    while (true) {
        const html = await fetchPage(page);
        if (!html) {
            console.log('Failed to fetch page. Ending scrape.');
            break;
        }
        
        const pageEvents = parseEvents(html);
        console.log(`Found ${pageEvents.length} events on page ${page}`);
        
        if (pageEvents.length === 0) {
            emptyPagesCount++;
            // If we hit 2 empty pages in a row, stop
            if (emptyPagesCount >= 2) {
                console.log('No more events found. Stopping.');
                break;
            }
        } else {
            emptyPagesCount = 0;
            allEvents = allEvents.concat(pageEvents);
        }
        
        page++;
        await sleep(1000); // 1-second delay
    }
    
    console.log(`Total events scraped: ${allEvents.length}`);
    
    // Sort events by start date ascending
    allEvents.sort((a, b) => a.startDate.localeCompare(b.startDate));
    
    const outputPath = path.join(__dirname, 'uwindsor-events.json');
    fs.writeFileSync(outputPath, JSON.stringify(allEvents, null, 2), 'utf-8');
    console.log(`Scraped data saved to ${outputPath}`);
}

scrapeAll();
