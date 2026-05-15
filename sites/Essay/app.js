const app = {
    init() {
        const enterBtn = document.getElementById('enter-btn');
        const welcomeScreen = document.getElementById('welcome-screen');
        const mainHub = document.getElementById('main-hub');

        if (enterBtn && welcomeScreen && mainHub) {
            enterBtn.addEventListener('click', () => {
                welcomeScreen.style.opacity = '0';
                welcomeScreen.style.transition = 'opacity 0.5s ease';
                
                setTimeout(() => {
                    welcomeScreen.style.display = 'none';
                    mainHub.classList.remove('hidden');
                    this.renderGrid();
                }, 500);
            });
        } else {
            console.error("Error: Could not find Welcome Screen elements.");
        }

        const homeBtn = document.getElementById('btn-home');
        if (homeBtn) {
            homeBtn.addEventListener('click', () => {
                location.reload();
            });
        }
    },

    renderGrid() {
        const grid = document.getElementById('article-grid');
        if (!grid) return;

        grid.innerHTML = '';

        if (!articlesDB || articlesDB.length === 0) {
            grid.innerHTML = '<p style="text-align:center; color:var(--text-muted); grid-column: 1/-1;">No articles found. Add some to config.js</p>';
            return;
        }

        articlesDB.forEach(article => {
            const card = document.createElement('div');
            card.className = 'article-card';
            // Redirect to the full HTML file
            card.onclick = () => this.openArticle(article.file);
            
            card.innerHTML = `
                <div>
                    <div class="card-meta">${article.category}</div>
                    <h2 class="card-title">${article.title}</h2>
                    <p class="card-desc">${article.description}</p>
                </div>
                <div class="card-date">${article.date}</div>
            `;
            grid.appendChild(card);
        });
    },

    openArticle(filePath) {
        // Redirect the browser to the full article page
        window.location.href = filePath;
    },

    goHome() {
        location.reload();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
    console.log("WASI-Discoveries System Initialized.");
});
