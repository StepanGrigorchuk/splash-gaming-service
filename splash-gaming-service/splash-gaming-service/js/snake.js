// Игра Змейка
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.overlay = document.getElementById('gameOverlay');
        this.scoreElement = document.getElementById('score');
        this.bestScoreElement = document.getElementById('bestScore');
        this.gameMessage = document.getElementById('gameMessage');
        this.gameSubmessage = document.getElementById('gameSubmessage');
        this.startButton = document.getElementById('startButton');
        this.pauseButton = document.getElementById('pauseButton');
        this.restartButton = document.getElementById('restartButton');
        
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        this.init();
    }
    
    init() {
        this.loadBestScore();
        this.bindEvents();
        this.showOverlay('start');
        this.setupTheme();
    }
    
    setupTheme() {
        // Применяем тему к canvas
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        this.colors = {
            background: isDark ? '#2d3748' : '#f7fafc',
            snake: isDark ? '#667eea' : '#667eea',
            snakeHead: isDark ? '#764ba2' : '#764ba2',
            food: isDark ? '#f093fb' : '#f093fb',
            grid: isDark ? '#4a5568' : '#e2e8f0'
        };
    }
    
    bindEvents() {
        // Кнопки
        this.startButton.addEventListener('click', () => this.startGame());
        this.pauseButton.addEventListener('click', () => this.togglePause());
        this.restartButton.addEventListener('click', () => this.restartGame());
        
        // Клавиатура
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // Тема
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                setTimeout(() => this.setupTheme(), 100);
            });
        }
    }
    
    startGame() {
        this.snake = [
            { x: 10, y: 10 }
        ];
        this.food = this.generateFood();
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gameRunning = true;
        this.paused = false;
        this.gameStartTime = Date.now();
        
        this.updateScore();
        this.hideOverlay();
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        if (!this.paused) {
            this.update();
            this.draw();
        }
        
        setTimeout(() => this.gameLoop(), 150);
    }
    
    update() {
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        
        // Проверка столкновения со стенами
        if (head.x < 0 || head.x >= this.tileCount || 
            head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        
        // Проверка столкновения с собой
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        // Проверка поедания еды
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.food = this.generateFood();
            this.createParticles(head.x * this.gridSize, head.y * this.gridSize);
        } else {
            this.snake.pop();
        }
    }
    
    draw() {
        // Очистка канваса
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисуем сетку
        this.drawGrid();
        
        // Рисуем змейку
        this.snake.forEach((segment, index) => {
            this.ctx.fillStyle = index === 0 ? this.colors.snakeHead : this.colors.snake;
            this.ctx.fillRect(
                segment.x * this.gridSize, 
                segment.y * this.gridSize, 
                this.gridSize - 2, 
                this.gridSize - 2
            );
        });
        
        // Рисуем еду
        this.ctx.fillStyle = this.colors.food;
        this.ctx.fillRect(
            this.food.x * this.gridSize, 
            this.food.y * this.gridSize, 
            this.gridSize - 2, 
            this.gridSize - 2
        );
    }
    
    drawGrid() {
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
    }
    
    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        
        return food;
    }
    
    handleKeyPress(e) {
        if (!this.gameRunning || this.paused) return;
        
        switch (e.key) {
            case 'ArrowUp':
                if (this.dy === 0) {
                    this.dx = 0;
                    this.dy = -1;
                }
                break;
            case 'ArrowDown':
                if (this.dy === 0) {
                    this.dx = 0;
                    this.dy = 1;
                }
                break;
            case 'ArrowLeft':
                if (this.dx === 0) {
                    this.dx = -1;
                    this.dy = 0;
                }
                break;
            case 'ArrowRight':
                if (this.dx === 0) {
                    this.dx = 1;
                    this.dy = 0;
                }
                break;
            case ' ':
                e.preventDefault();
                this.togglePause();
                break;
        }
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
        const gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
        
        // Сохраняем рекорд
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('snake-best-score', this.bestScore);
            this.bestScoreElement.textContent = this.bestScore;
        }
        
        // Сохраняем статистику
        if (window.app) {
            window.app.saveGameStats('snake', this.score, gameTime);
        }
        
        this.showOverlay('gameOver');
        this.createGameOverEffect();
    }
    
    showOverlay(type) {
        switch (type) {
            case 'start':
                this.gameMessage.textContent = 'Нажмите SPACE для старта';
                this.gameSubmessage.textContent = 'Используйте стрелки для управления';
                this.startButton.textContent = 'Начать игру';
                break;
            case 'pause':
                this.gameMessage.textContent = 'Пауза';
                this.gameSubmessage.textContent = 'Нажмите SPACE для продолжения';
                this.startButton.textContent = 'Продолжить';
                break;
            case 'gameOver':
                this.gameMessage.textContent = 'Игра окончена!';
                this.gameSubmessage.textContent = `Ваш результат: ${this.score} очков`;
                this.startButton.textContent = 'Играть снова';
                break;
        }
        
        this.overlay.classList.add('active');
    }
    
    hideOverlay() {
        this.overlay.classList.remove('active');
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
        this.scoreElement.classList.add('score-animation');
        setTimeout(() => {
            this.scoreElement.classList.remove('score-animation');
        }, 300);
    }
    
    loadBestScore() {
        this.bestScore = parseInt(localStorage.getItem('snake-best-score') || '0');
        this.bestScoreElement.textContent = this.bestScore;
    }
    
    createParticles(x, y) {
        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = x + this.gridSize / 2 + 'px';
            particle.style.top = y + this.gridSize / 2 + 'px';
            particle.style.setProperty('--random-x', (Math.random() - 0.5) * 100 + 'px');
            particle.style.setProperty('--random-y', -Math.random() * 100 - 50 + 'px');
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 1000);
        }
    }
    
    createGameOverEffect() {
        this.canvas.classList.add('game-over-animation');
        setTimeout(() => {
            this.canvas.classList.remove('game-over-animation');
        }, 500);
    }
}

// Инициализация игры
let snakeGame;
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация темы
    const savedTheme = localStorage.getItem('splash-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        }
        
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('splash-theme', newTheme);
            
            icon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        });
    }
    
    // Инициализация игры
    snakeGame = new SnakeGame();
});
