// Игра Пятнашки
class PuzzleGame {
    constructor() {
        this.board = document.getElementById('puzzleBoard');
        this.overlay = document.getElementById('gameOverlay');
        this.movesElement = document.getElementById('moves');
        this.timeElement = document.getElementById('time');
        this.bestMovesElement = document.getElementById('bestMoves');
        this.gameMessage = document.getElementById('gameMessage');
        this.gameSubmessage = document.getElementById('gameSubmessage');
        this.startButton = document.getElementById('startButton');
        this.shuffleButton = document.getElementById('shuffleButton');
        this.solveButton = document.getElementById('solveButton');
        this.restartButton = document.getElementById('restartButton');
        
        this.size = 4;
        this.tiles = [];
        this.moves = 0;
        this.startTime = 0;
        this.gameRunning = false;
        this.timer = null;
        
        this.init();
    }
    
    init() {
        this.loadBestScore();
        this.bindEvents();
        this.createBoard();
        this.setupTheme();
        this.showOverlay('start');
    }
    
    setupTheme() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                setTimeout(() => this.updateTileColors(), 100);
            });
        }
    }
    
    updateTileColors() {
        const tiles = document.querySelectorAll('.puzzle-tile');
        tiles.forEach(tile => {
            if (!tile.classList.contains('empty')) {
                // Принудительное обновление стилей
                tile.style.background = '';
                tile.style.color = '';
            }
        });
    }
    
    bindEvents() {
        this.startButton.addEventListener('click', () => this.startGame());
        this.shuffleButton.addEventListener('click', () => this.shuffleBoard());
        this.solveButton.addEventListener('click', () => this.showHint());
        this.restartButton.addEventListener('click', () => this.restartGame());
        
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const savedTheme = localStorage.getItem('splash-theme') || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
            
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
    }
    
    createBoard() {
        this.board.innerHTML = '';
        this.tiles = [];
        
        // Создаем правильно решенную доску
        for (let i = 1; i <= 15; i++) {
            this.tiles.push(i);
        }
        this.tiles.push(0); // Пустая клетка
        
        this.renderBoard();
    }
    
    renderBoard() {
        this.board.innerHTML = '';
        
        this.tiles.forEach((tile, index) => {
            const tileElement = document.createElement('div');
            tileElement.className = 'puzzle-tile';
            
            if (tile === 0) {
                tileElement.classList.add('empty');
            } else {
                tileElement.textContent = tile;
                tileElement.addEventListener('click', () => this.moveTile(index));
            }
            
            this.board.appendChild(tileElement);
        });
    }
    
    startGame() {
        this.shuffleBoard();
        this.moves = 0;
        this.startTime = Date.now();
        this.gameRunning = true;
        this.updateStats();
        this.hideOverlay();
        this.startTimer();
    }
    
    shuffleBoard() {
        // Случайное перемешивание, гарантирующее решаемость
        const shuffleMoves = 1000;
        const emptyIndex = this.tiles.indexOf(0);
        let currentEmpty = emptyIndex;
        
        for (let i = 0; i < shuffleMoves; i++) {
            const neighbors = this.getNeighbors(currentEmpty);
            const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
            
            // Меняем местами
            this.tiles[currentEmpty] = this.tiles[randomNeighbor];
            this.tiles[randomNeighbor] = 0;
            currentEmpty = randomNeighbor;
        }
        
        this.renderBoard();
    }
    
    getNeighbors(index) {
        const neighbors = [];
        const row = Math.floor(index / this.size);
        const col = index % this.size;
        
        // Верхний сосед
        if (row > 0) neighbors.push(index - this.size);
        // Нижний сосед
        if (row < this.size - 1) neighbors.push(index + this.size);
        // Левый сосед
        if (col > 0) neighbors.push(index - 1);
        // Правый сосед
        if (col < this.size - 1) neighbors.push(index + 1);
        
        return neighbors;
    }
    
    moveTile(tileIndex) {
        if (!this.gameRunning) return;
        
        const emptyIndex = this.tiles.indexOf(0);
        const neighbors = this.getNeighbors(emptyIndex);
        
        if (neighbors.includes(tileIndex)) {
            // Меняем местами
            this.tiles[emptyIndex] = this.tiles[tileIndex];
            this.tiles[tileIndex] = 0;
            
            this.moves++;
            this.updateStats();
            this.renderBoard();
            this.createMoveEffect(tileIndex);
            
            if (this.checkWin()) {
                this.gameWon();
            }
        }
    }
    
    handleKeyPress(e) {
        if (!this.gameRunning) return;
        
        const emptyIndex = this.tiles.indexOf(0);
        const row = Math.floor(emptyIndex / this.size);
        const col = emptyIndex % this.size;
        
        let targetIndex = -1;
        
        switch (e.key) {
            case 'ArrowUp':
                if (row < this.size - 1) targetIndex = emptyIndex + this.size;
                break;
            case 'ArrowDown':
                if (row > 0) targetIndex = emptyIndex - this.size;
                break;
            case 'ArrowLeft':
                if (col < this.size - 1) targetIndex = emptyIndex + 1;
                break;
            case 'ArrowRight':
                if (col > 0) targetIndex = emptyIndex - 1;
                break;
        }
        
        if (targetIndex !== -1) {
            this.moveTile(targetIndex);
        }
    }
    
    checkWin() {
        for (let i = 0; i < 15; i++) {
            if (this.tiles[i] !== i + 1) {
                return false;
            }
        }
        return this.tiles[15] === 0;
    }
    
    gameWon() {
        this.gameRunning = false;
        this.stopTimer();
        
        const gameTime = Math.floor((Date.now() - this.startTime) / 1000);
        
        // Сохраняем рекорд
        if (this.moves < this.bestMoves || this.bestMoves === Infinity) {
            this.bestMoves = this.moves;
            localStorage.setItem('puzzle-best-moves', this.bestMoves);
            this.bestMovesElement.textContent = this.bestMoves;
        }
        
        // Сохраняем статистику
        if (window.app) {
            window.app.saveGameStats('puzzle', this.moves, gameTime);
        }
        
        this.showOverlay('win');
        this.createWinEffect();
    }
    
    showHint() {
        if (!this.gameRunning) return;
        
        // Подсвечиваем правильную позицию для случайной неправильной плитки
        const wrongTiles = [];
        
        for (let i = 0; i < 15; i++) {
            if (this.tiles[i] !== i + 1) {
                wrongTiles.push(i);
            }
        }
        
        if (wrongTiles.length > 0) {
            const randomWrongTile = wrongTiles[Math.floor(Math.random() * wrongTiles.length)];
            const tileElements = document.querySelectorAll('.puzzle-tile');
            
            tileElements[randomWrongTile].classList.add('highlight');
            setTimeout(() => {
                tileElements[randomWrongTile].classList.remove('highlight');
            }, 2000);
        }
    }
    
    restartGame() {
        this.gameRunning = false;
        this.stopTimer();
        this.createBoard();
        this.showOverlay('start');
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            if (this.gameRunning) {
                const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                this.timeElement.textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    showOverlay(type) {
        switch (type) {
            case 'start':
                this.gameMessage.textContent = 'Добро пожаловать!';
                this.gameSubmessage.textContent = 'Расставьте числа от 1 до 15 в правильном порядке';
                this.startButton.textContent = 'Новая игра';
                break;
            case 'win':
                this.gameMessage.textContent = 'Поздравляем! 🎉';
                this.gameSubmessage.textContent = `Решено за ${this.moves} ходов`;
                this.startButton.textContent = 'Играть снова';
                break;
        }
        
        this.overlay.classList.add('active');
    }
    
    hideOverlay() {
        this.overlay.classList.remove('active');
    }
    
    updateStats() {
        this.movesElement.textContent = this.moves;
        this.movesElement.classList.add('score-animation');
        setTimeout(() => {
            this.movesElement.classList.remove('score-animation');
        }, 300);
    }
    
    loadBestScore() {
        this.bestMoves = parseInt(localStorage.getItem('puzzle-best-moves') || 'Infinity');
        this.bestMovesElement.textContent = this.bestMoves === Infinity ? '∞' : this.bestMoves;
    }
    
    createMoveEffect(tileIndex) {
        const tileElement = document.querySelectorAll('.puzzle-tile')[tileIndex];
        tileElement.style.transform = 'scale(0.95)';
        setTimeout(() => {
            tileElement.style.transform = 'scale(1)';
        }, 150);
    }
    
    createWinEffect() {
        // Создаем эффект конфетти
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * window.innerWidth + 'px';
            particle.style.top = Math.random() * window.innerHeight + 'px';
            particle.style.setProperty('--random-x', (Math.random() - 0.5) * 300 + 'px');
            particle.style.setProperty('--random-y', -Math.random() * 300 - 100 + 'px');
            particle.style.background = ['#667eea', '#764ba2', '#f093fb', '#00f5ff', '#ffff00'][Math.floor(Math.random() * 5)];
            particle.style.width = '8px';
            particle.style.height = '8px';
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 1000);
        }
        
        // Анимация доски
        this.board.classList.add('game-over-animation');
        setTimeout(() => {
            this.board.classList.remove('game-over-animation');
        }, 500);
    }
}

// Инициализация игры
let puzzleGame;
document.addEventListener('DOMContentLoaded', () => {
    puzzleGame = new PuzzleGame();
});
