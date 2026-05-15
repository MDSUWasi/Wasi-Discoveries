/* 
    Wasi-Discoveries - Main Application Logic
    Pure Vanilla JS | 0% External Dependencies | Privacy First
*/

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    initTheme();
    initFilters();
    initFuzzySearch();
    initGallery();
    initLightbox();
    initPhysicsSim();
    initDashboard();
    initKeyboardNav();
    initReminderModal(); // Ensures the warning pops up every visit
    showToast("Welcome to Wasi's Discoveries!", "info");
}

// --- 1. Theme & Colors ---
function initTheme() {
    const toggle = document.getElementById('theme-toggle');
    const picker = document.getElementById('theme-color-picker');
    
    if (!toggle || !picker) return;

    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedColor = localStorage.getItem('accentColor') || '#1877f2';
    
    applyTheme(savedTheme, savedColor);

    toggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next, picker.value);
        localStorage.setItem('theme', next);
    });

    picker.addEventListener('change', (e) => {
        applyTheme(document.documentElement.getAttribute('data-theme'), e.target.value);
        localStorage.setItem('accentColor', e.target.value);
    });
}

function applyTheme(theme, color) {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.setProperty('--accent-blue', color);
    document.documentElement.style.setProperty('--accent-hover', color);
    const btn = document.getElementById('theme-toggle');
    if(btn) btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
}

// --- 2. Fuzzy Search ---
function initFuzzySearch() {
    const input = document.getElementById('gallery-search');
    const cards = document.querySelectorAll('.gallery-card');
    
    if (!input) return;

    input.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const currentFilter = document.querySelector('.filter-btn.active');
        const filterVal = currentFilter ? currentFilter.dataset.filter : 'all';

        cards.forEach(card => {
            const text = card.innerText.toLowerCase();
            const category = card.dataset.category;
            
            // Fuzzy match logic
            const isMatch = text.includes(term) || (term.length > 2 && text.split('').filter(c => term.includes(c)).length > term.length * 0.7);
            const matchesFilter = filterVal === 'all' || category === filterVal;
            
            if (isMatch && matchesFilter) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// --- 3. Gallery & Skeleton ---
function initGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
    
    // Your Custom Data
    const sampleData = [
        { 
            cat: 'Articles', 
            title: 'No-Cloning Theorem', 
            snippet: 'Natural copy protection. Quantum state cannot be copied.', 
            img: 'images/No-Cloning Theorem.jpg',
            link: 'sites/Articles/articles/No-Cloning Theorem.html' 
        },
        { 
            cat: 'Discoveries', 
            title: 'Space Rocket (Under Development)', 
            snippet: 'Building space rocket from scratch', 
            img: 'images/SpaceRocket.jpg', 
            link: 'sites/Discoveries/discoveries/index.html' 
        }
    ];

    sampleData.forEach((item, index) => {
        const card = document.createElement('a');
        card.className = 'gallery-card';
        card.dataset.category = item.cat;
        card.style.animationDelay = `${index * 0.1}s`;
        card.href = item.link || '#';

        
        card.innerHTML = `
            <div class="card-image">
                <div class="skeleton"></div>
                <img src="${item.img}" alt="${item.title}">
                <div class="overlay">View Details</div>
            </div>
            <div class="card-content">
                <span class="category-tag">${item.cat}</span>
                <h3>${item.title}</h3>
                <p>${item.snippet}</p>
            </div>
        `;
        grid.appendChild(card);

        const img = card.querySelector('img');
        // Only remove skeleton if image loads successfully
        img.onload = () => card.querySelector('.skeleton').remove();
        // If image fails, skeleton remains (or you can remove it manually if preferred)
        // img.onerror = () => card.querySelector('.skeleton').remove(); 
    });

    // Scroll Animation Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.gallery-card').forEach(card => observer.observe(card));
}

// --- 4. Functional Filters ---
function initFilters() {
    const btns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.gallery-card');
    
    if (btns.length === 0) return;

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const val = btn.dataset.filter;
            
            cards.forEach(card => {
                const category = card.dataset.category;
                if (val === 'all' || category === val) {
                    card.style.display = 'flex';
                    card.classList.remove('visible');
                    setTimeout(() => card.classList.add('visible'), 10);
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// --- 5. Lightbox ---
function initLightbox() {
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');
    
    if (!lb || !lbImg || !closeBtn) return;

    document.querySelectorAll('.card-image img').forEach(img => {
        img.addEventListener('click', () => {
            lbImg.src = img.src;
            lb.style.display = 'flex';
        });
    });

    closeBtn.addEventListener('click', () => lb.style.display = 'none');
    lb.addEventListener('click', (e) => { 
        if(e.target === lb) lb.style.display = 'none'; 
    });
}

// --- 6. Physics Sim (Right Sidebar) ---
function initPhysicsSim() {
    const canvas = document.getElementById('pendulumCanvas');
    if (!canvas) return; 
    
    const ctx = canvas.getContext('2d');
    const gInput = document.getElementById('gravityRange');
    const resetBtn = document.getElementById('resetPendulum');
    
    let angle = Math.PI / 4;
    let vel = 0;
    
    function animate() {
        const g = parseFloat(gInput.value) || 20;
        const len = 60; 
        const acc = (-1 * g / len) * Math.sin(angle);
        vel += acc;
        vel *= 0.99;
        angle += vel;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const ox = canvas.width / 2;
        const oy = 20;
        const bx = ox + len * Math.sin(angle);
        const by = oy + len * Math.cos(angle);
        
        ctx.beginPath(); 
        ctx.moveTo(ox, oy); 
        ctx.lineTo(bx, by); 
        ctx.strokeStyle = '#333'; 
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.beginPath(); 
        ctx.arc(bx, by, 8, 0, Math.PI*2); 
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-blue'); 
        ctx.fill();
        
        requestAnimationFrame(animate);
    }
    animate();
    
    if(resetBtn) {
        resetBtn.onclick = () => { angle = Math.PI/4; vel = 0; };
    }
}

// --- 7. Dashboard ---
function initDashboard() {
    const statusDot = document.getElementById('connection-status');
    const statusText = document.getElementById('status-text');
    
    if (statusDot && statusText) {
        window.addEventListener('online', () => { 
            statusDot.className = 'status-dot online'; 
            statusText.textContent = 'Online'; 
        });
        window.addEventListener('offline', () => { 
            statusDot.className = 'status-dot offline'; 
            statusText.textContent = 'Offline'; 
        });
    }
    
    const quotes = [
        { q: "Science is not only a disciple of reason but also one of romance and passion.", a: "Stephen Hawking" },
        { q: "The important thing is not to stop questioning.", a: "Albert Einstein" },
        { q: "Look up at the stars and not down at your feet.", a: "Stephen Hawking" }
    ];
    const day = new Date().getDay();
    const quote = quotes[day % quotes.length];
    
    const quoteEl = document.getElementById('quote-of-day');
    const citeEl = document.querySelector('#quote-of-day + cite');
    
    if (quoteEl) quoteEl.textContent = `"${quote.q}"`;
    if (citeEl) citeEl.textContent = `- ${quote.a}`;
    
    const clearBtn = document.getElementById('clear-cache');
    if(clearBtn) {
        clearBtn.onclick = async () => {
            const caches = await window.caches.keys();
            caches.forEach(c => window.caches.delete(c));
            showToast("Cache Cleared", "info");
        };
    }
}

// --- 8. Keyboard Navigation ---
function initKeyboardNav() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.lightbox, .modal-overlay').forEach(el => el.style.display = 'none');
        }
        if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
            const visibleCards = Array.from(document.querySelectorAll('.gallery-card:not([style*="display: none"])'));
            const current = document.activeElement;
            const index = visibleCards.indexOf(current);
            if (index !== -1) {
                e.preventDefault();
                const nextIndex = e.key === 'ArrowRight' ? (index + 1) % visibleCards.length : (index - 1 + visibleCards.length) % visibleCards.length;
                visibleCards[nextIndex].focus();
            }
        }
    });
}

// --- 9. Toast Notifications ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText = `
        background: ${type === 'success' ? '#2ecc71' : '#333'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
        font-size: 0.9rem;
    `;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add keyframes dynamically if not present
if (!document.querySelector('#toast-animations')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'toast-animations';
    styleSheet.innerText = `
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
    `;
    document.head.appendChild(styleSheet);
}

// --- 10. Mandatory Reminder Modal ---
function initReminderModal() {
    const modal = document.getElementById('reminder-modal');
    const agreeBtn = document.getElementById('agree-btn');
    
    if (!modal || !agreeBtn) return;

    // Show modal immediately on load (Every time)
    modal.style.display = 'flex';

    // When user clicks "Agree", hide the modal
    agreeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}
