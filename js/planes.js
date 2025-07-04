// Игра Самолёты
class PlanesGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Проверяем, что canvas найден
        if (!this.canvas) {
            console.error('Canvas не найден!');
            return;
        }
        
        // Принудительно устанавливаем размеры canvas
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        this.overlay = document.getElementById('gameOverlay');
        this.scoreElement = document.getElementById('score');
        this.bestScoreElement = document.getElementById('bestScore');
        this.livesElement = document.getElementById('lives');
        this.gameMessage = document.getElementById('gameMessage');
        this.gameSubmessage = document.getElementById('gameSubmessage');
        this.startButton = document.getElementById('startButton');
        this.pauseButton = document.getElementById('pauseButton');
        this.restartButton = document.getElementById('restartButton');
        
        this.gameRunning = false;
        this.paused = false;
        this.score = 0;
        this.lives = 3;
        this.bestScore = 0;
        
        // Игровые объекты
        this.player = {
            x: this.canvas.width / 2 - 25,
            y: this.canvas.height - 80,
            width: 50,
            height: 30,
            speed: 5
        };
        
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        
        // Игровые настройки
        this.bulletSpeed = 7;
        this.enemySpeed = 2;
        this.enemySpawnRate = 0.02;
        this.enemySpawnTimer = 0;
        
        this.init();
    }
    
    init() {
        this.setupTheme(); // Сначала настраиваем тему
        this.loadBestScore();
        this.bindEvents();
        
        // Принудительно рисуем начальное состояние
        this.renderInitialState();
        
        // Показываем overlay после отрисовки
        this.showOverlay('start');
    }
    
    renderInitialState() {
        if (!this.ctx) {
            console.error('Контекст canvas не найден!');
            return;
        }
        
        // Очистка canvas
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисуем звёзды на фоне
        this.drawStars();
        
        // Рисуем игрока в начальной позиции
        this.drawPlayer();
    }
    
    setupTheme() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        this.colors = {
            background: isDark ? '#1a202c' : '#f7fafc',
            player: isDark ? '#4299e1' : '#3182ce',
            bullet: isDark ? '#fbd38d' : '#ed8936',
            enemy: isDark ? '#f56565' : '#e53e3e',
            particle: isDark ? '#fbb6ce' : '#d53f8c',
            ui: isDark ? '#e2e8f0' : '#2d3748'
        };
    }
    
    bindEvents() {
        // Кнопки
        this.startButton.addEventListener('click', () => this.startGame());
        this.pauseButton.addEventListener('click', () => this.togglePause());
        this.restartButton.addEventListener('click', () => this.restartGame());
        
        // Клавиатура
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        document.addEventListener('keyup', (e) => this.handleKeyRelease(e));
        
        // Тема
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                setTimeout(() => this.setupTheme(), 100);
            });
        }
    }
    
    handleKeyPress(e) {
        if (!this.gameRunning) return;
        
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.keys = this.keys || {};
                this.keys.left = true;
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.keys = this.keys || {};
                this.keys.right = true;
                break;
            case ' ':
                e.preventDefault();
                if (!this.paused) {
                    this.shoot();
                }
                break;
            case 'p':
            case 'P':
                e.preventDefault();
                this.togglePause();
                break;
        }
    }
    
    handleKeyRelease(e) {
        if (!this.gameRunning) return;
        
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.keys = this.keys || {};
                this.keys.left = false;
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.keys = this.keys || {};
                this.keys.right = false;
                break;
        }
    }
    
    startGame() {
        this.gameRunning = true;
        this.paused = false;
        this.score = 0;
        this.lives = 3;
        this.keys = {};
        
        // Сброс игровых объектов
        this.player.x = this.canvas.width / 2 - 25;
        this.player.y = this.canvas.height - 80;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.enemySpawnTimer = 0;
        
        this.updateScore();
        this.updateLives();
        this.hideOverlay();
        this.gameLoop();
    }
    
    shoot() {
        this.bullets.push({
            x: this.player.x + this.player.width / 2 - 2,
            y: this.player.y,
            width: 4,
            height: 10,
            speed: this.bulletSpeed
        });
    }
    
    spawnEnemy() {
        this.enemies.push({
            x: Math.random() * (this.canvas.width - 40),
            y: -40,
            width: 40,
            height: 30,
            speed: this.enemySpeed + Math.random() * 2,
            health: 1
        });
    }
    
    createParticles(x, y, color) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 30,
                maxLife: 30,
                color: color
            });
        }
    }
    
    update() {
        if (!this.gameRunning || this.paused) return;
        
        // Обновление игрока
        if (this.keys.left && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if (this.keys.right && this.player.x < this.canvas.width - this.player.width) {
            this.player.x += this.player.speed;
        }
        
        // Обновление пуль
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            return bullet.y > -bullet.height;
        });
        
        // Спавн врагов
        this.enemySpawnTimer += this.enemySpawnRate;
        if (this.enemySpawnTimer >= 1) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
        }
        
        // Обновление врагов
        this.enemies = this.enemies.filter(enemy => {
            enemy.y += enemy.speed;
            
            // Проверка столкновения с игроком
            if (this.checkCollision(this.player, enemy)) {
                this.createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, this.colors.enemy);
                this.lives--;
                this.updateLives();
                if (this.lives <= 0) {
                    this.gameOver();
                }
                return false;
            }
            
            return enemy.y < this.canvas.height;
        });
        
        // Проверка столкновений пуль с врагами
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            let bulletHit = false;
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                
                if (this.checkCollision(bullet, enemy)) {
                    // Удаляем пулю и врага
                    this.bullets.splice(i, 1);
                    this.enemies.splice(j, 1);
                    
                    // Создаем частицы
                    this.createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, this.colors.enemy);
                    
                    // Увеличиваем счёт
                    this.score += 10;
                    this.updateScore();
                    
                    bulletHit = true;
                    break;
                }
            }
            
            if (bulletHit) break;
        }
        
        // Обновление частиц
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            return particle.life > 0;
        });
        
        // Увеличиваем сложность
        if (this.score > 0 && this.score % 100 === 0) {
            this.enemySpeed += 0.1;
            this.enemySpawnRate += 0.005;
        }
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    render() {
        // Очистка canvas
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисуем звёзды на фоне
        this.drawStars();
        
        // Рисуем игрока
        this.drawPlayer();
        
        // Рисуем пули
        this.bullets.forEach(bullet => {
            this.ctx.fillStyle = this.colors.bullet;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
        
        // Рисуем врагов
        this.enemies.forEach(enemy => {
            this.drawEnemy(enemy);
        });
        
        // Рисуем частицы
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x, particle.y, 3, 3);
            this.ctx.globalAlpha = 1;
        });
    }
    
    drawStars() {
        this.ctx.fillStyle = this.colors.ui;
        for (let i = 0; i < 50; i++) {
            const x = (i * 137) % this.canvas.width;
            const y = (i * 197) % this.canvas.height;
            this.ctx.fillRect(x, y, 1, 1);
        }
    }
    
    drawPlayer() {
        const { x, y, width, height } = this.player;
        
        // Корпус самолёта
        this.ctx.fillStyle = this.colors.player;
        this.ctx.fillRect(x + width/2 - 4, y, 8, height);
        
        // Крылья
        this.ctx.fillRect(x, y + height/2, width, 8);
        
        // Нос самолёта
        this.ctx.beginPath();
        this.ctx.moveTo(x + width/2, y);
        this.ctx.lineTo(x + width/2 - 6, y + 12);
        this.ctx.lineTo(x + width/2 + 6, y + 12);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawEnemy(enemy) {
        const { x, y, width, height } = enemy;
        
        // Корпус вражеского самолёта
        this.ctx.fillStyle = this.colors.enemy;
        this.ctx.fillRect(x + width/2 - 4, y, 8, height);
        
        // Крылья
        this.ctx.fillRect(x, y + height/2, width, 6);
        
        // Хвост
        this.ctx.fillRect(x + width/2 - 6, y + height - 8, 12, 8);
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.update();
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.bestScoreElement.textContent = this.bestScore;
            this.saveBestScore();
        }
    }
    
    updateLives() {
        this.livesElement.textContent = this.lives;
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.paused = !this.paused;
        this.pauseButton.innerHTML = this.paused ? 
            '<i class="fas fa-play"></i> Продолжить' : 
            '<i class="fas fa-pause"></i> Пауза';
            
        if (this.paused) {
            this.showOverlay('pause');
        } else {
            this.hideOverlay();
        }
    }
    
    restartGame() {
        this.gameRunning = false;
        this.paused = false;
        this.pauseButton.innerHTML = '<i class="fas fa-pause"></i> Пауза';
        this.startGame();
    }
    
    gameOver() {
        this.gameRunning = false;
        this.paused = false;
        this.pauseButton.innerHTML = '<i class="fas fa-pause"></i> Пауза';
        
        this.showOverlay('gameOver');
    }
    
    showOverlay(type) {
        this.overlay.style.display = 'flex';
        this.overlay.classList.add('active'); // Добавляем класс active
        
        switch (type) {
            case 'start':
                this.gameMessage.textContent = 'Готовы к полёту?';
                this.gameSubmessage.textContent = 'Используйте стрелки для управления и пробел для стрельбы';
                this.startButton.style.display = 'inline-block';
                this.pauseButton.style.display = 'none';
                this.restartButton.style.display = 'none';
                break;
            case 'pause':
                this.gameMessage.textContent = 'Пауза';
                this.gameSubmessage.textContent = 'Игра приостановлена';
                this.startButton.style.display = 'none';
                this.pauseButton.style.display = 'inline-block';
                this.restartButton.style.display = 'inline-block';
                break;
            case 'gameOver':
                this.gameMessage.textContent = 'Игра окончена!';
                this.gameSubmessage.textContent = `Ваш счёт: ${this.score}`;
                this.startButton.style.display = 'none';
                this.pauseButton.style.display = 'none';
                this.restartButton.style.display = 'inline-block';
                break;
        }
    }
    
    hideOverlay() {
        this.overlay.classList.remove('active'); // Убираем класс active
        // Скрываем overlay с задержкой для плавного перехода
        setTimeout(() => {
            this.overlay.style.display = 'none';
        }, 300);
        
        this.startButton.style.display = 'none';
        this.pauseButton.style.display = 'inline-block';
        this.restartButton.style.display = 'inline-block';
    }
    
    loadBestScore() {
        const saved = localStorage.getItem('planes-best-score');
        if (saved) {
            this.bestScore = parseInt(saved);
            this.bestScoreElement.textContent = this.bestScore;
        }
    }
    
    saveBestScore() {
        localStorage.setItem('planes-best-score', this.bestScore.toString());
    }
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    new PlanesGame();
});
