// Игра Тетрис
class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        this.overlay = document.getElementById('gameOverlay');
        
        this.scoreElement = document.getElementById('score');
        this.linesElement = document.getElementById('lines');
        this.levelElement = document.getElementById('level');
        this.bestScoreElement = document.getElementById('bestScore');
        this.gameMessage = document.getElementById('gameMessage');
        this.gameSubmessage = document.getElementById('gameSubmessage');
        this.startButton = document.getElementById('startButton');
        this.pauseButton = document.getElementById('pauseButton');
        this.restartButton = document.getElementById('restartButton');
        
        this.blockSize = 30;
        this.boardWidth = 10;
        this.boardHeight = 20;
        
        this.shapes = [
            // I-фигура
            [
                [1, 1, 1, 1]
            ],
            // O-фигура
            [
                [1, 1],
                [1, 1]
            ],
            // T-фигура
            [
                [0, 1, 0],
                [1, 1, 1]
            ],
            // S-фигура
            [
                [0, 1, 1],
                [1, 1, 0]
            ],
            // Z-фигура
            [
                [1, 1, 0],
                [0, 1, 1]
            ],
            // J-фигура
            [
                [1, 0, 0],
                [1, 1, 1]
            ],
            // L-фигура
            [
                [0, 0, 1],
                [1, 1, 1]
            ]
        ];
        
        this.colors = [
            '#00f5ff', // I - голубой
            '#ffff00', // O - желтый
            '#a000ff', // T - фиолетовый
            '#00ff00', // S - зеленый
            '#ff0000', // Z - красный
            '#0000ff', // J - синий
            '#ff7f00'  // L - оранжевый
        ];
        
        this.init();
    }
    
    init() {
        this.loadBestScore();
        this.bindEvents();
        this.showOverlay('start');
        this.setupTheme();
    }
    
    setupTheme() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        this.bgColor = isDark ? '#2d3748' : '#f7fafc';
        this.gridColor = isDark ? '#4a5568' : '#e2e8f0';
        this.shadowColor = isDark ? '#1a202c' : '#ffffff';
    }
    
    bindEvents() {
        this.startButton.addEventListener('click', () => this.startGame());
        this.pauseButton.addEventListener('click', () => this.togglePause());
        this.restartButton.addEventListener('click', () => this.restartGame());
        
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                setTimeout(() => this.setupTheme(), 100);
            });
        }
    }
    
    startGame() {
        this.board = Array(this.boardHeight).fill().map(() => Array(this.boardWidth).fill(0));
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameRunning = true;
        this.paused = false;
        this.gameStartTime = Date.now();
        this.dropTime = 0;
        this.dropInterval = 1000;
        
        this.currentPiece = this.generatePiece();
        this.nextPiece = this.generatePiece();
        
        this.updateStats();
        this.hideOverlay();
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        const currentTime = Date.now();
        
        if (!this.paused) {
            if (currentTime - this.dropTime > this.dropInterval) {
                this.dropPiece();
                this.dropTime = currentTime;
            }
            
            this.draw();
            this.drawNext();
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    generatePiece() {
        const typeIndex = Math.floor(Math.random() * this.shapes.length);
        return {
            shape: this.shapes[typeIndex],
            x: Math.floor(this.boardWidth / 2) - Math.floor(this.shapes[typeIndex][0].length / 2),
            y: 0,
            type: typeIndex
        };
    }
    
    dropPiece() {
        const newPiece = { ...this.currentPiece, y: this.currentPiece.y + 1 };
        
        if (this.isValidMove(newPiece)) {
            this.currentPiece = newPiece;
        } else {
            this.placePiece();
            this.clearLines();
            this.currentPiece = this.nextPiece;
            this.nextPiece = this.generatePiece();
            
            if (!this.isValidMove(this.currentPiece)) {
                this.gameOver();
            }
        }
    }
    
    isValidMove(piece) {
        for (let row = 0; row < piece.shape.length; row++) {
            for (let col = 0; col < piece.shape[row].length; col++) {
                if (piece.shape[row][col]) {
                    const newX = piece.x + col;
                    const newY = piece.y + row;
                    
                    if (newX < 0 || newX >= this.boardWidth || 
                        newY >= this.boardHeight || 
                        (newY >= 0 && this.board[newY][newX])) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    placePiece() {
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    const boardY = this.currentPiece.y + row;
                    const boardX = this.currentPiece.x + col;
                    
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.type + 1;
                    }
                }
            }
        }
    }
    
    clearLines() {
        let clearedLines = 0;
        
        for (let row = this.boardHeight - 1; row >= 0; row--) {
            if (this.board[row].every(cell => cell !== 0)) {
                this.board.splice(row, 1);
                this.board.unshift(new Array(this.boardWidth).fill(0));
                clearedLines++;
                row++; // Проверяем эту строку снова
            }
        }
        
        if (clearedLines > 0) {
            this.lines += clearedLines;
            this.score += clearedLines * 100 * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
            this.updateStats();
            this.createClearEffect();
        }
    }
    
    rotatePiece() {
        const rotated = this.currentPiece.shape[0].map((_, index) =>
            this.currentPiece.shape.map(row => row[index]).reverse()
        );
        
        const rotatedPiece = { ...this.currentPiece, shape: rotated };
        
        if (this.isValidMove(rotatedPiece)) {
            this.currentPiece = rotatedPiece;
        }
    }
    
    movePiece(dx, dy) {
        const newPiece = { 
            ...this.currentPiece, 
            x: this.currentPiece.x + dx, 
            y: this.currentPiece.y + dy 
        };
        
        if (this.isValidMove(newPiece)) {
            this.currentPiece = newPiece;
        }
    }
    
    hardDrop() {
        while (this.isValidMove({ ...this.currentPiece, y: this.currentPiece.y + 1 })) {
            this.currentPiece.y++;
        }
        this.dropPiece();
    }
    
    draw() {
        // Очистка
        this.ctx.fillStyle = this.bgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Сетка
        this.drawGrid();
        
        // Размещенные блоки
        for (let row = 0; row < this.boardHeight; row++) {
            for (let col = 0; col < this.boardWidth; col++) {
                if (this.board[row][col]) {
                    this.drawBlock(col, row, this.colors[this.board[row][col] - 1]);
                }
            }
        }
        
        // Текущая фигура
        if (this.currentPiece) {
            this.drawPiece(this.currentPiece);
        }
        
        // Тень (предварительный просмотр)
        this.drawShadow();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = this.gridColor;
        this.ctx.lineWidth = 1;
        
        for (let row = 0; row <= this.boardHeight; row++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, row * this.blockSize);
            this.ctx.lineTo(this.canvas.width, row * this.blockSize);
            this.ctx.stroke();
        }
        
        for (let col = 0; col <= this.boardWidth; col++) {
            this.ctx.beginPath();
            this.ctx.moveTo(col * this.blockSize, 0);
            this.ctx.lineTo(col * this.blockSize, this.canvas.height);
            this.ctx.stroke();
        }
    }
    
    drawBlock(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
        
        // Тень
        this.ctx.fillStyle = this.shadowColor;
        this.ctx.fillRect(x * this.blockSize + 2, y * this.blockSize + 2, this.blockSize - 4, this.blockSize - 4);
        
        // Граница
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
    }
    
    drawPiece(piece) {
        for (let row = 0; row < piece.shape.length; row++) {
            for (let col = 0; col < piece.shape[row].length; col++) {
                if (piece.shape[row][col]) {
                    this.drawBlock(piece.x + col, piece.y + row, this.colors[piece.type]);
                }
            }
        }
    }
    
    drawShadow() {
        if (!this.currentPiece) return;
        
        const shadowPiece = { ...this.currentPiece };
        while (this.isValidMove({ ...shadowPiece, y: shadowPiece.y + 1 })) {
            shadowPiece.y++;
        }
        
        this.ctx.fillStyle = this.colors[shadowPiece.type];
        this.ctx.globalAlpha = 0.3;
        
        for (let row = 0; row < shadowPiece.shape.length; row++) {
            for (let col = 0; col < shadowPiece.shape[row].length; col++) {
                if (shadowPiece.shape[row][col]) {
                    this.ctx.fillRect(
                        (shadowPiece.x + col) * this.blockSize,
                        (shadowPiece.y + row) * this.blockSize,
                        this.blockSize,
                        this.blockSize
                    );
                }
            }
        }
        
        this.ctx.globalAlpha = 1;
    }
    
    drawNext() {
        this.nextCtx.fillStyle = this.bgColor;
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (this.nextPiece) {
            const offsetX = (this.nextCanvas.width - this.nextPiece.shape[0].length * 20) / 2;
            const offsetY = (this.nextCanvas.height - this.nextPiece.shape.length * 20) / 2;
            
            this.nextCtx.fillStyle = this.colors[this.nextPiece.type];
            
            for (let row = 0; row < this.nextPiece.shape.length; row++) {
                for (let col = 0; col < this.nextPiece.shape[row].length; col++) {
                    if (this.nextPiece.shape[row][col]) {
                        this.nextCtx.fillRect(
                            offsetX + col * 20,
                            offsetY + row * 20,
                            18,
                            18
                        );
                    }
                }
            }
        }
    }
    
    handleKeyPress(e) {
        if (!this.gameRunning || this.paused) return;
        
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault(); // Блокируем навигацию по странице
                this.movePiece(-1, 0);
                break;
            case 'ArrowRight':
                e.preventDefault(); // Блокируем навигацию по странице
                this.movePiece(1, 0);
                break;
            case 'ArrowDown':
                e.preventDefault(); // Блокируем навигацию по странице
                this.movePiece(0, 1);
                break;
            case 'ArrowUp':
                e.preventDefault(); // Блокируем навигацию по странице
                this.rotatePiece();
                break;
            case ' ':
                e.preventDefault();
                this.hardDrop();
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
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('tetris-best-score', this.bestScore);
            this.bestScoreElement.textContent = this.bestScore;
        }
        
        if (window.app) {
            window.app.saveGameStats('tetris', this.score, gameTime);
        }
        
        this.showOverlay('gameOver');
        this.createGameOverEffect();
    }
    
    showOverlay(type) {
        switch (type) {
            case 'start':
                this.gameMessage.textContent = 'Нажмите SPACE для старта';
                this.gameSubmessage.textContent = 'Стрелки - управление, ↑ - поворот';
                this.startButton.textContent = 'Начать игру';
                break;
            case 'pause':
                this.gameMessage.textContent = 'Пауза';
                this.gameSubmessage.textContent = 'Нажмите для продолжения';
                this.startButton.textContent = 'Продолжить';
                break;
            case 'gameOver':
                this.gameMessage.textContent = 'Игра окончена!';
                this.gameSubmessage.textContent = `Очки: ${this.score}, Линии: ${this.lines}`;
                this.startButton.textContent = 'Играть снова';
                break;
        }
        
        this.overlay.classList.add('active');
    }
    
    hideOverlay() {
        this.overlay.classList.remove('active');
    }
    
    updateStats() {
        this.scoreElement.textContent = this.score;
        this.linesElement.textContent = this.lines;
        this.levelElement.textContent = this.level;
        
        this.scoreElement.classList.add('score-animation');
        setTimeout(() => {
            this.scoreElement.classList.remove('score-animation');
        }, 300);
    }
    
    loadBestScore() {
        this.bestScore = parseInt(localStorage.getItem('tetris-best-score') || '0');
        this.bestScoreElement.textContent = this.bestScore;
    }
    
    createClearEffect() {
        // Эффект очистки линий
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 300 + 'px';
            particle.style.top = Math.random() * 600 + 'px';
            particle.style.setProperty('--random-x', (Math.random() - 0.5) * 200 + 'px');
            particle.style.setProperty('--random-y', -Math.random() * 200 - 100 + 'px');
            particle.style.background = this.colors[Math.floor(Math.random() * this.colors.length)];
            
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
let tetrisGame;
document.addEventListener('DOMContentLoaded', () => {
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
    
    tetrisGame = new TetrisGame();
});
