// Основные функции сайта
class SplashApp {
    constructor() {
        this.games = [
            {
                id: 'snake',
                title: 'Змейка',
                description: 'Классическая игра змейка. Собирайте еду и растите!',
                icon: '🐍',
                difficulty: 'Легко',
                duration: '5-10 мин',
                file: 'snake.html'
            },
            {
                id: 'tetris',
                title: 'Тетрис',
                description: 'Складывайте блоки и очищайте линии.',
                icon: '🧩',
                difficulty: 'Средне',
                duration: '10-15 мин',
                file: 'tetris.html'
            },
            {
                id: 'puzzle',
                title: 'Пятнашки',
                description: 'Расставьте числа в правильном порядке.',
                icon: '🔢',
                difficulty: 'Легко',
                duration: '5-10 мин',
                file: 'puzzle.html'
            },
            {
                id: 'memory',
                title: 'Память',
                description: 'Найдите все пары одинаковых карточек.',
                icon: '🧠',
                difficulty: 'Средне',
                duration: '5-10 мин',
                file: 'memory.html'
            },
            {
                id: 'planes',
                title: 'Самолёты',
                description: 'Летайте на самолёте и уничтожайте вражеские цели.',
                icon: '✈️',
                difficulty: 'Средне',
                duration: '10-15 мин',
                file: 'planes.html'
            }
        ];
        
        this.init();
    }
    
    init() {
        this.loadTheme();
        this.bindEvents();
        this.renderGames();
        this.startAnimations();
    }
    
    // Загрузка темы
    loadTheme() {
        const savedTheme = localStorage.getItem('splash-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }
    
    // Переключение темы
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('splash-theme', newTheme);
        this.updateThemeIcon(newTheme);
    }
    
    // Обновление иконки темы
    updateThemeIcon(theme) {
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }
    
    // Привязка событий
    bindEvents() {
        // Переключение темы
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Плавная прокрутка
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Анимации при прокрутке
        this.setupScrollAnimations();
    }
    
    // Рендеринг игр
    renderGames() {
        const gamesGrid = document.getElementById('gamesGrid');
        if (!gamesGrid) return;
        
        gamesGrid.innerHTML = this.games.map(game => `
            <div class="game-card fade-in" onclick="app.openGame('${game.id}')">
                <div class="game-image">
                    <span style="font-size: 4rem;">${game.icon}</span>
                </div>
                <div class="game-content">
                    <h3 class="game-title">${game.title}</h3>
                    <p class="game-description">${game.description}</p>
                    <div class="game-meta">
                        <span>Сложность: ${game.difficulty}</span>
                        <span>${game.duration}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Открытие игры
    openGame(gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (game) {
            // Сохраняем информацию о последней игре
            localStorage.setItem('splash-last-game', gameId);
            
            // Открываем игру
            window.location.href = `games/${game.file}`;
        }
    }
    
    // Анимации при прокрутке
    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, {
            threshold: 0.1
        });
        
        // Наблюдаем за элементами
        document.querySelectorAll('.game-card, .feature, .about-text').forEach(el => {
            observer.observe(el);
        });
    }
    
    // Запуск анимаций
    startAnimations() {
        // Анимация появления элементов
        const elements = document.querySelectorAll('.hero-title, .hero-description, .cta-button');
        elements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('fade-in');
            }, index * 200);
        });
    }
    
    // Сохранение статистики
    saveGameStats(gameId, score, time) {
        const stats = JSON.parse(localStorage.getItem('splash-stats') || '{}');
        if (!stats[gameId]) {
            stats[gameId] = {
                plays: 0,
                bestScore: 0,
                totalTime: 0
            };
        }
        
        stats[gameId].plays++;
        stats[gameId].bestScore = Math.max(stats[gameId].bestScore, score);
        stats[gameId].totalTime += time;
        
        localStorage.setItem('splash-stats', JSON.stringify(stats));
    }
    
    // Получение статистики
    getGameStats(gameId) {
        const stats = JSON.parse(localStorage.getItem('splash-stats') || '{}');
        return stats[gameId] || {
            plays: 0,
            bestScore: 0,
            totalTime: 0
        };
    }
}

// Глобальные функции для кнопок
function scrollToGames() {
    const gamesSection = document.getElementById('games');
    if (gamesSection) {
        gamesSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function showAllGames() {
    // Показываем все игры (можно добавить фильтры)
    const gamesGrid = document.getElementById('gamesGrid');
    if (gamesGrid) {
        gamesGrid.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Инициализация приложения
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new SplashApp();
});

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SplashApp;
}
