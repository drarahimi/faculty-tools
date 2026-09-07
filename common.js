/**
 * Faculty Tools Common Library
 * Provides Command Palette (Ctrl+K), Quick Tool Switcher Header, Starred/Recent Tools, Dark Mode, and Toast notifications.
 */

const FACULTY_TOOLS = [
    // Teaching & Accreditation
    { id: 'brightspace-to-ceab', title: 'Brightspace to CEAB', description: 'Convert Brightspace grade exports to CEAB-compliant format.', category: 'Teaching & Accreditation', icon: 'library', path: 'brightspace-to-ceab.html' },
    { id: 'committee-selector', title: 'Committee Selector', description: 'Select an appropriate graduate committee based on research interests and expertise.', category: 'Teaching & Accreditation', icon: 'users', path: 'committee-selector.html' },
    { id: 'course-mapping-tool', title: 'Course Mapping Tool', description: 'Visualize and manage course mappings for the MAME program.', category: 'Teaching & Accreditation', icon: 'map', path: 'course-mapping.html' },
    { id: 'grade-curve-calculator', title: 'Grade Curving Calculator', description: 'Compute exam statistics, apply standard academic curves, and export CSVs.', category: 'Teaching & Accreditation', icon: 'calculator', path: 'grade-curve-calculator.html' },
    { id: 'reference-letter-builder', title: 'Reference Letter Builder', description: 'Generate structured academic recommendation letters for grad school & scholarships.', category: 'Teaching & Accreditation', icon: 'file-check', path: 'reference-letter-builder.html' },

    // Research & Conferences
    { id: 'ieee-conferences', title: 'IEEE Conference Directory', description: 'Search flagship IEEE conferences worldwide with deadlines, calendar exports, and ranks.', category: 'Research & Conferences', icon: 'globe', path: 'ieee-conferences.html' },
    { id: 'citation-generator', title: 'Citation Generator', description: 'Convert DOIs or search titles to format BibTeX, APA, MLA, IEEE, and Chicago.', category: 'Research & Conferences', icon: 'quote', path: 'citation-generator.html' },
    { id: 'bib-cleaner-tool', title: 'Bib Cleaner Tool', description: 'Clean and format bibliographic entries for LaTeX / BibTeX.', category: 'Research & Conferences', icon: 'file-text', path: 'bib-cleaner.html' },
    { id: 'latex-flattener-tool', title: 'LaTeX Flattener Tool', description: 'Flatten nested LaTeX structures for improved compatibility.', category: 'Research & Conferences', icon: 'file-code', path: 'latex-flattener.html' },
    { id: 'proceedings-compiler', title: 'Compile Proceedings', description: 'Compile accepted paper PDFs into a single proceedings PDF with table of contents.', category: 'Research & Conferences', icon: 'book-open', path: 'proceedings-compiler.html' },
    { id: 'latex-equation-editor', title: 'LaTeX Equation Builder', description: 'Interactive live visual KaTeX equation editor with symbol palettes.', category: 'Research & Conferences', icon: 'binary', path: 'latex-equation-editor.html' },
    { id: 'image-to-equation', title: 'Image to Equation Converter', description: 'Convert math screenshots into LaTeX ($$) and MS Word OMML equation formats.', category: 'Research & Conferences', icon: 'file-digit', path: 'image-to-equation.html' },

    // Grants & Funding
    { id: 'nserc-discovery-helper', title: 'NSERC Discovery Grant Helper', description: 'Interactive 5-year budget planner, HQP ratio calculator, LaTeX & CSV exporters.', category: 'Grants & Funding', icon: 'award', path: 'nserc-discovery.html' },
    { id: 'travel-policy-tool', title: 'Travel Policy Tool', description: 'Access and view the latest university travel policies and procedures.', category: 'Grants & Funding', icon: 'plane', path: 'travel-policy.html' },

    // PDF & Document Suite
    { id: 'pdf-editor', title: 'PDF Suite & Editor', description: 'Extract pages, combine multiple PDFs, add rubber stamps & watermarks, rotate/reorder pages.', category: 'PDF & Document Suite', icon: 'file-edit', path: 'pdf-editor.html' },
    { id: 'pdf-redactor', title: 'Secure PDF Redactor', description: 'Redact sensitive info from bank statements or locked PDFs by secure flattening.', category: 'PDF & Document Suite', icon: 'shield-alert', path: 'pdf-redactor.html' },
    { id: 'pdf-fill-sign', title: 'PDF Fill & Sign', description: 'Fill out PDF forms, add checkmarks, and sign documents securely in-browser.', category: 'PDF & Document Suite', icon: 'signature', path: 'pdf-fill-sign.html' },

    // Data & Utilities
    { id: 'uwindsor-academic-calendar', title: 'UWindsor Academic Calendar', description: 'Interactive calendar of registrar dates with categories, search, and ICS export.', category: 'Data & Utilities', icon: 'calendar', path: 'academic-calendar.html' },
    { id: 'image-converter', title: 'Universal Image Converter', description: 'Batch convert images between SVG, WebP, PNG, JPEG, GIF, BMP, ICO, AVIF.', category: 'Data & Utilities', icon: 'file-image', path: 'image-converter.html' },
    { id: 'case-converter', title: 'Case Converter', description: 'Convert text to sentence case, title case, camelCase, snake_case, UPPERCASE, and more.', category: 'Data & Utilities', icon: 'case-sensitive', path: 'case-converter.html' },
    { id: 'json-deduplicator-tool', title: 'JSON Deduplicator', description: 'Remove duplicate entries from JSON arrays.', category: 'Data & Utilities', icon: 'file-code', path: 'json-deduplicator.html' },

    // Simulations & Interactive
    { id: 'quadcopter-simulator', title: '3D Quadcopter Simulator', description: 'Interactive 3D WebGL 6-DOF Quadcopter Flight Dynamics & Cascaded PID Control Lab.', category: 'Simulations & Interactive', icon: 'crosshair', path: 'quadcopter-simulator.html' },
    { id: '3dof-quanser-simulator', title: '3DOF Quanser Simulator', description: 'A simulator for testing and validating 3DOF Quanser control systems.', category: 'Simulations & Interactive', icon: 'cog', path: '3dof-quanser-simulator.html' },
    { id: 'bubblehead-dog', title: 'Bubblehead Dog', description: 'Interactive bobblehead dog simulation for relaxation & testing.', category: 'Simulations & Interactive', icon: 'dog', path: 'bubblehead-dog.html' }
];

// Initialize Theme
(function initTheme() {
    const savedTheme = localStorage.getItem('faculty_tools_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
})();

window.updateThemeIcons = function() {
    const isDark = document.documentElement.classList.contains('dark');
    document.querySelectorAll('[data-theme-icon]').forEach(icon => {
        icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
    });
    if (window.lucide) lucide.createIcons();
};

window.toggleFacultyTheme = function() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('faculty_tools_theme', isDark ? 'dark' : 'light');
    window.updateThemeIcons();
    if (window.showToast) window.showToast(isDark ? 'Dark mode enabled' : 'Light mode enabled');
    return isDark;
};

// Starred & Recent Tools State Management
window.getStarredToolIds = function() {
    return new Set(JSON.parse(localStorage.getItem('faculty_starred_tools') || '[]'));
};

window.toggleStarTool = function(toolId) {
    const set = window.getStarredToolIds();
    if (set.has(toolId)) {
        set.delete(toolId);
        if (window.showToast) window.showToast("Removed from favorite tools");
    } else {
        set.add(toolId);
        if (window.showToast) window.showToast("Added to favorite tools!");
    }
    localStorage.setItem('faculty_starred_tools', JSON.stringify(Array.from(set)));
    if (window.onStarredToolsChanged) window.onStarredToolsChanged();
};

window.recordToolVisit = function(path) {
    let recents = JSON.parse(localStorage.getItem('faculty_recent_tools') || '[]');
    recents = recents.filter(p => p !== path);
    recents.unshift(path);
    if (recents.length > 6) recents.pop();
    localStorage.setItem('faculty_recent_tools', JSON.stringify(recents));
};

// Record current page visit
(function recordCurrentPage() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPath !== 'index.html') {
        window.recordToolVisit(currentPath);
    }
})();

// Unregister all Service Workers & Clear Cache Storage
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
        for (let registration of registrations) {
            registration.unregister();
        }
    });
}
if ('caches' in window) {
    caches.keys().then(names => {
        for (let name of names) {
            caches.delete(name);
        }
    });
}

// Global Toast System
window.showToast = function(message, duration = 3000) {
    let toast = document.getElementById('global-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'global-toast';
        toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-medium shadow-xl opacity-0 pointer-events-none transition-all duration-300 flex items-center gap-2 border border-slate-700';
        document.body.appendChild(toast);
    }

    toast.innerHTML = `<i data-lucide="info" class="w-4 h-4 text-teal-400"></i><span>${message}</span>`;
    if (window.lucide) lucide.createIcons();

    toast.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-2');

    setTimeout(() => {
        toast.classList.add('opacity-0', 'pointer-events-none', 'translate-y-2');
    }, duration);
};

// Global Command Palette (Ctrl+K) & Header Quick Switcher
window.initGlobalNavigation = function() {
    // 1. Render Header Quick Tool Dropdown if #header-quick-nav exists
    const quickNavContainer = document.getElementById('header-quick-nav');
    if (quickNavContainer) {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const optionsHtml = FACULTY_TOOLS.map(t => `<option value="${t.path}" ${t.path === currentPath ? 'selected' : ''}>${t.title}</option>`).join('');

        quickNavContainer.innerHTML = `
            <div class="relative flex items-center">
                <select onchange="if(this.value) window.location.href=this.value;" class="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all cursor-pointer pr-7">
                    <option value="index.html">-- Jump to Tool --</option>
                    ${optionsHtml}
                </select>
            </div>
        `;
    }

    // 2. Inject Command Palette Modal (Ctrl+K)
    if (!document.getElementById('command-palette-modal')) {
        const modal = document.createElement('div');
        modal.id = 'command-palette-modal';
        modal.className = 'fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4 opacity-0 pointer-events-none transition-all duration-200';
        modal.innerHTML = `
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col transform scale-95 transition-all duration-200" id="command-palette-card">
                <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <i data-lucide="search" class="w-5 h-5 text-slate-400"></i>
                    <input type="text" id="cmd-search-input" placeholder="Type a tool name or command..." class="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-medium">
                    <kbd class="px-2 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-500">ESC</kbd>
                </div>
                <div id="cmd-results-list" class="max-h-80 overflow-y-auto p-2 space-y-1">
                    <!-- Results injected here -->
                </div>
                <div class="p-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Navigate with <kbd class="px-1 bg-white dark:bg-slate-800 border rounded">↑</kbd> <kbd class="px-1 bg-white dark:bg-slate-800 border rounded">↓</kbd></span>
                    <span>Press <kbd class="px-1 bg-white dark:bg-slate-800 border rounded">ENTER</kbd> to open</span>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Bind Command Palette Search
        const searchInput = document.getElementById('cmd-search-input');
        const resultsList = document.getElementById('cmd-results-list');

        function renderCmdResults(query = '') {
            const q = query.toLowerCase().trim();
            const filtered = FACULTY_TOOLS.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));

            if (filtered.length === 0) {
                resultsList.innerHTML = `<div class="p-4 text-center text-xs text-slate-400">No tools found matching "${query}"</div>`;
            } else {
                resultsList.innerHTML = filtered.map((t, idx) => `
                    <div data-path="${t.path}" class="cmd-item p-2.5 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950/40 cursor-pointer flex items-center justify-between group transition-colors ${idx === 0 ? 'bg-teal-50/70 dark:bg-teal-950/30' : ''}">
                        <div class="flex items-center gap-3">
                            <div class="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-teal-100 dark:group-hover:bg-teal-900 text-slate-600 dark:text-slate-300 group-hover:text-teal-600 transition-colors">
                                <i data-lucide="${t.icon}" class="w-4 h-4"></i>
                            </div>
                            <div>
                                <h4 class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">${t.title}</h4>
                                <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">${t.description}</p>
                            </div>
                        </div>
                        <span class="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">${t.category}</span>
                    </div>
                `).join('');
            }

            if (window.lucide) lucide.createIcons();

            // Bind clicks
            document.querySelectorAll('.cmd-item').forEach(item => {
                item.onclick = () => {
                    window.location.href = item.getAttribute('data-path');
                };
            });
        }

        searchInput.oninput = (e) => renderCmdResults(e.target.value);

        // Shortcut Key Listeners (Ctrl+K or Cmd+K)
        window.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                const isHidden = modal.classList.contains('pointer-events-none');
                if (isHidden) {
                    modal.classList.remove('opacity-0', 'pointer-events-none');
                    document.getElementById('command-palette-card').classList.remove('scale-95');
                    renderCmdResults('');
                    setTimeout(() => searchInput.focus(), 50);
                } else {
                    modal.classList.add('opacity-0', 'pointer-events-none');
                    document.getElementById('command-palette-card').classList.add('scale-95');
                }
            } else if (e.key === 'Escape') {
                modal.classList.add('opacity-0', 'pointer-events-none');
                document.getElementById('command-palette-card').classList.add('scale-95');
            }
        });

        // Click outside modal to close
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.classList.add('opacity-0', 'pointer-events-none');
                document.getElementById('command-palette-card').classList.add('scale-95');
            }
        };
    }
};

window.addEventListener('DOMContentLoaded', () => {
    window.initGlobalNavigation();
    window.updateThemeIcons();
    if (window.lucide) lucide.createIcons();
});

