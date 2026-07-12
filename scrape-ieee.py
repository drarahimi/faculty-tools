import os
import sys
import json
import argparse
import datetime
import asyncio
import subprocess
import urllib.request
import urllib.parse
import re

# Ensure dependencies are installed for the Playwright part
try:
    import playwright
except ImportError:
    print("Playwright is NOT installed. Installing playwright now...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "playwright"])
        subprocess.check_call([sys.executable, "-m", "playwright", "install", "chromium"])
        import playwright
        print("Playwright installed successfully.")
    except Exception as e:
        print(f"Error installing Playwright: {e}")
        print("Please run manually: pip install playwright && playwright install chromium")
        sys.exit(1)

from playwright.async_api import async_playwright

async def scrape_societies():
    # Direct societies URL (redirected destination)
    url = "https://www.ieee.org/communities-connection/societies-councils-and-communities/societies"
    print(f"Opening browser in stealth mode to scrape societies from: {url}")
    
    societies = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=["--disable-blink-features=AutomationControlled", "--no-sandbox"]
        )
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            locale="en-US"
        )
        page = await context.new_page()
        await page.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        try:
            print("Navigating to IEEE societies directory...")
            response = await page.goto(url, wait_until="domcontentloaded", timeout=60000)
            print(f"Page loaded with status: {response.status if response else 'Unknown'}")
            
            # Wait for content to load
            await page.wait_for_selector("div.c--stacked-cards, div.card", timeout=20000)
            
            # Extract links
            links = await page.query_selector_all("div.f--field.f--cta-title h3 a, div.card h3 a")
            print(f"Found {len(links)} society entries.")
            
            for link in links:
                text = await link.inner_text()
                href = await link.get_attribute("href")
                
                if not text or not href:
                    continue
                
                text = text.strip().replace("\n", " ").replace("  ", " ")
                href = href.strip()
                
                # Extract acronym in parentheses e.g. "IEEE Aerospace and Electronic Systems Society (AESS)"
                abbr_match = re.search(r"\(([^)]+)\)$", text)
                acronym = abbr_match.group(1).strip() if abbr_match else ""
                
                # Name is everything before parentheses
                name = re.sub(r"\s*\([^)]+\)$", "", text).strip()
                
                # Manual overrides for missing acronyms in texts
                if not acronym:
                    if "computer" in name.lower():
                        acronym = "IEEE CS"
                    elif "photonics" in name.lower():
                        acronym = "Photonics"
                    elif "magnetics" in name.lower():
                        acronym = "Magnetics"
                    elif "sensors" in name.lower():
                        acronym = "Sensors"
                
                full_url = href if href.startswith("http") else f"https://www.ieee.org{href}"
                
                societies.append({
                    "society": name,
                    "acronym": acronym,
                    "url": full_url
                })
                
        except Exception as e:
            print(f"Error scraping societies: {e}")
        finally:
            await browser.close()
            
    # Save results
    output_path = "ieee-societies.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(societies, f, indent=4, ensure_ascii=False)
        
    print(f"Saved {len(societies)} societies to {output_path}")
    return societies

# Helper to format date ranges
def format_dates(start_str, end_str):
    try:
        start_date = datetime.datetime.strptime(start_str, "%Y-%m-%d")
        end_date = datetime.datetime.strptime(end_str, "%Y-%m-%d")
        if start_date == end_date:
            return start_date.strftime("%b %d, %Y")
        elif start_date.month == end_date.month:
            return f"{start_date.strftime('%b %d')}–{end_date.strftime('%d, %Y')}"
        else:
            return f"{start_date.strftime('%b %d')}–{end_date.strftime('%b %d, %Y')}"
    except:
        return f"{start_str} to {end_str}"

# Direct API scraper for conferences
def scrape_conferences(query, start_year):
    current_year = start_year or datetime.datetime.now().year
    end_year = current_year + 1
    
    print(f"Starting API-based conference scraper for query='{query}' from {current_year} to {end_year}")
    
    api_url = "https://conference-api.ieee.org/conf/searchfacet"
    details_url_base = "https://conference-api.ieee.org/conf/details"
    
    headers = {
        'x-api-key': 'tiztktxAhobOx8B5Kwbv4lvbS2xqQjr8gBIF82Td',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/x-www-form-urlencoded;'
    }
    
    pos = 0
    event_ids = []
    conferences = []
    
    # Step 1: Retrieve all matching event IDs page by page
    print("Fetching list of events...")
    while True:
        data = {
            'q': query,
            'subsequent_q': '',
            'date': 'all',
            'from': f"{current_year}-01-01",
            'to': f"{end_year}-12-31",
            'region': 'all',
            'country': 'all',
            'pos': pos,
            'sortorder': 'desc',
            'sponsor': '',
            'sponsor_type': 'all',
            'state': 'all',
            'field_of_interest': 'all',
            'sortfield': 'relevance',
            'searchmode': 'basic',
            'virtualConfReadOnly': 'N',
            'eventformat': ''
        }
        
        payload = urllib.parse.urlencode(data).encode('utf-8')
        req = urllib.request.Request(api_url, data=payload, headers=headers, method='POST')
        
        try:
            with urllib.request.urlopen(req) as response:
                content = response.read().decode('utf-8')
                parsed = json.loads(content)
                results = parsed.get("entity", {}).get("results", [])
                
                if not results:
                    break
                
                print(f"  Page {pos + 1}: Found {len(results)} events.")
                for item in results:
                    event_ids.append(item.get("eventId"))
                
                pos += 1
                # If page is not full, it's the last one
                if len(results) < 10:
                    break
        except Exception as e:
            print(f"Error fetching page {pos + 1}: {e}")
            break
            
    print(f"Total events found: {len(event_ids)}")
    
    # Step 2: Fetch detailed metadata for each event ID
    print("\nFetching detailed metadata and websites for events...")
    for idx, event_id in enumerate(event_ids):
        detail_api_url = f"{details_url_base}?id={event_id}"
        print(f"[{idx+1}/{len(event_ids)}] Fetching details for Event ID: {event_id}...")
        
        try:
            req = urllib.request.Request(detail_api_url, headers=headers, method='GET')
            with urllib.request.urlopen(req) as response:
                content = response.read().decode('utf-8')
                parsed = json.loads(content)
                detail = parsed.get("entity", {}).get("eventDetail", {})
                
                if not detail:
                    print("  Warning: No detail details found.")
                    continue
                
                title = detail.get("eventTitle", "").strip()
                start_date = detail.get("startDate", "")
                end_date = detail.get("endDate", "")
                dates = format_dates(start_date, end_date)
                
                location_obj = detail.get("location", {})
                city = location_obj.get("city", "").strip()
                country = location_obj.get("country", "").strip()
                location = f"{city}, {country}" if city and country else (city or country or "TBA")
                
                event_format = detail.get("eventFormat", "In-Person").title()
                sponsors_str = detail.get("sponsors", "")
                sponsors = [s.strip() for s in sponsors_str.split(";") if s.strip()]
                
                about_str = detail.get("about", "")
                fields = [f.strip() for f in about_str.split(";") if f.strip()]
                
                website = detail.get("url", "").strip()
                if website and not website.startswith("http"):
                    website = f"https://{website}"
                
                # Estimate year
                year_match = re.search(r"\b(202\d)\b", title + " " + dates)
                year = int(year_match.group(1)) if year_match else current_year
                
                # Map region based on country
                region = "Global"
                country_lower = country.lower()
                if any(c in country_lower for c in ["usa", "canada", "mexico", "united states"]):
                    region = "North America"
                elif any(c in country_lower for c in ["brazil", "argentina", "chile", "colombia"]):
                    region = "South America"
                elif any(c in country_lower for c in ["uk", "united kingdom", "germany", "france", "italy", "spain", "netherlands", "sweden", "switzerland", "europe"]):
                    region = "Europe"
                elif any(c in country_lower for c in ["china", "japan", "korea", "india", "singapore", "australia", "taiwan", "asia"]):
                    region = "Asia-Pacific"
                elif any(c in country_lower for c in ["egypt", "south africa", "morocco", "africa"]):
                    region = "Africa"
                elif any(c in country_lower for c in ["uae", "saudi", "qatar", "israel", "jordan", "middle east"]):
                    region = "Middle East"
                
                # Map society and acronym based on sponsors
                society = "IEEE"
                acronym = "IEEE"
                
                # Check for major IEEE societies matching sponsors
                sponsors_lower = sponsors_str.lower()
                if "robotics and automation" in sponsors_lower:
                    society = "Robotics and Automation Society"
                    acronym = "RAS"
                elif "communications society" in sponsors_lower or "comsoc" in sponsors_lower:
                    society = "Communications Society"
                    acronym = "ComSoc"
                elif "computer society" in sponsors_lower:
                    society = "Computer Society"
                    acronym = "IEEE CS"
                elif "signal processing" in sponsors_lower:
                    society = "Signal Processing Society"
                    acronym = "SPS"
                elif "power & energy" in sponsors_lower or "power and energy" in sponsors_lower:
                    society = "Power & Energy Society"
                    acronym = "PES"
                elif "circuits and systems" in sponsors_lower:
                    society = "Circuits and Systems Society"
                    acronym = "CASS"
                elif "electron devices" in sponsors_lower:
                    society = "Electron Devices Society"
                    acronym = "EDS"
                elif "microwave theory" in sponsors_lower:
                    society = "Microwave Theory and Technology Society"
                    acronym = "MTT-S"
                elif "solid-state circuits" in sponsors_lower:
                    society = "Solid-State Circuits Society"
                    acronym = "SSCS"
                elif "control systems" in sponsors_lower:
                    society = "Control Systems Society"
                    acronym = "CSS"
                
                # If no specific society found, default to the first sponsor if it contains "Society" or "Council"
                if society == "IEEE" and sponsors:
                    for sp in sponsors:
                        if "society" in sp.lower() or "council" in sp.lower():
                            society = sp
                            # Make a quick acronym
                            acronym = "".join([w[0].upper() for w in sp.split() if w[0].isalpha() and w.lower() not in ["and", "on", "of", "in"]])
                            break
                
                conferences.append({
                    "society": society,
                    "acronym": acronym,
                    "name": title,
                    "confAcronym": re.search(r"\(([^)]+)\)$", title).group(1).strip() if re.search(r"\(([^)]+)\)$", title) else title[:10],
                    "year": year,
                    "dates": dates,
                    "location": location,
                    "region": region,
                    "url": website or f"https://conferences.ieee.org/conferences_events/conferences/conferencedetails/{event_id}",
                    "tags": fields[:4] if fields else ["IEEE"],
                    "is_scraped": True
                })
                
                print(f"  -> {title[:50]}... website: {website}")
        except Exception as e:
            print(f"  -> Error resolving event {event_id}: {e}")
            
        # Intermittent save
        if idx % 5 == 0 or idx == len(event_ids) - 1:
            output_path = "ieee-conferences.json"
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(conferences, f, indent=4, ensure_ascii=False)
                
    print(f"\nSuccessfully finished scraping conferences. Total: {len(conferences)}")
    return conferences

def main():
    parser = argparse.ArgumentParser(description="Scrape societies and conferences from official IEEE websites.")
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # Societies subcommand
    subparsers.add_parser("societies", help="Scrape IEEE technical societies list.")
    
    # Conferences subcommand
    conf_parser = subparsers.add_parser("conferences", help="Scrape IEEE conferences by search query.")
    conf_parser.add_argument("--query", type=str, default="robotics", help="Search query (e.g. robotics, communication, signal).")
    conf_parser.add_argument("--year", type=int, default=None, help="Start year of search (defaults to current year).")
    
    args = parser.parse_args()
    
    if args.command == "societies":
        asyncio.run(scrape_societies())
    elif args.command == "conferences":
        scrape_conferences(args.query, args.year)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
