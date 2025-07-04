// Игра на память
class MemoryGame {
    constructor() {
        this.board = document.getElementById('memoryBoard');
        this.overlay = document.getElementById('gameOverlay');
        this.attemptsElement = document.getElementById('attempts');
        this.pairsElement = document.getElementById('pairs');
        this.timeElement = document.getElementById('time');
        this.bestAttemptsElement = document.getElementById('bestAttempts');
        this.gameMessage = document.getElementById('gameMessage');
        this.gameSubmessage = document.getElementById('gameSubmessage');
        this.startButton = document.getElementById('startButton');
        this.newGameButton = document.getElementById('newGameButton');
        this.restartButton = document.getElementById('restartButton');
        
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.attempts = 0;
        this.totalPairs = 8;
        this.gameRunning = false;
        this.startTime = 0;
        this.timer = null;
        this.canFlip = true;
        
        this.cardSymbols = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎸', '🎺'];
        
        this.init();
    }
    
    init() {
        this.loadBestScore();
        this.bindEvents();
        this.setupTheme();
        this.showOverlay('start');
    }
    
    setupTheme() {
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
    
    bindEvents() {
        this.startButton.addEventListener('click', () => this.startGame());
        this.newGameButton.addEventListener('click', () => this.startGame());
        this.restartButton.addEventListener('click', () => this.restartGame());
    }
    
    startGame() {
        this.initializeCards();
        this.shuffleCards();
        this.renderBoard();
        this.resetStats();
        this.gameRunning = true;
        this.hideOverlay();
        this.startTimer();
    }
    
    initializeCards() {
        this.cards = [];
        // Создаем пары карточек
        for (let i = 0; i < this.totalPairs; i++) {
            this.cards.push({
                id: i * 2,
                symbol: this.cardSymbols[i],
                matched: false,
                flipped: false
            });
            this.cards.push({
                id: i * 2 + 1,
                symbol: this.cardSymbols[i],
                matched: false,
                flipped: false
            });
        }
    }
    
    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    
    renderBoard() {
        this.board.innerHTML = '';
        
        this.cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'memory-card';
            cardElement.dataset.index = index;
            
            if (card.matched) {
                cardElement.classList.add('matched');
            } else if (card.flipped) {
                cardElement.classList.add('flipped');
            }
            
            cardElement.innerHTML = card.symbol;
            cardElement.addEventListener('click', () => this.flipCard(index));
            
            this.board.appendChild(cardElement);
        });
    }
    
    flipCard(index) {
        if (!this.gameRunning || !this.canFlip || this.flippedCards.length >= 2) return;
        
        const card = this.cards[index];
        if (card.flipped || card.matched) return;
        
        card.flipped = true;
        this.flippedCards.push(index);
        
        const cardElement = document.querySelector(`[data-index="${index}"]`);
        cardElement.classList.add('flipped');
        
        if (this.flippedCards.length === 2) {
            this.attempts++;
            this.updateStats();
            this.checkMatch();
        }
    }
    
    checkMatch() {
        this.canFlip = false;
        
        setTimeout(() => {
            const [firstIndex, secondIndex] = this.flippedCards;
            const firstCard = this.cards[firstIndex];
            const secondCard = this.cards[secondIndex];
            
            if (firstCard.symbol === secondCard.symbol) {
                // Совпадение найдено
                firstCard.matched = true;
                secondCard.matched = true;
                this.matchedPairs++;
                
                const firstElement = document.querySelector(`[data-index="${firstIndex}"]`);
                const secondElement = document.querySelector(`[data-index="${secondIndex}"]`);
                
                firstElement.classList.add('matched');
                secondElement.classList.add('matched');
                
                this.createMatchEffect(firstElement, secondElement);
                this.updateStats();
                
                if (this.matchedPairs === this.totalPairs) {
                    this.gameWon();
                }
            } else {
                // Не совпадают
                firstCard.flipped = false;
                secondCard.flipped = false;
                
                const firstElement = document.querySelector(`[data-index="${firstIndex}"]`);
                const secondElement = document.querySelector(`[data-index="${secondIndex}"]`);
                
                firstElement.classList.add('wrong');
                secondElement.classList.add('wrong');
                
                setTimeout(() => {
                    firstElement.classList.remove('flipped', 'wrong');
                    secondElement.classList.remove('flipped', 'wrong');
                }, 600);
            }
            
            this.flippedCards = [];
            this.canFlip = true;
        }, 1000);
    }
    
    gameWon() {
        this.gameRunning = false;
        this.stopTimer();
        
        const gameTime = Math.floor((Date.now() - this.startTime) / 1000);
        
        // Сохраняем рекорд
        if (this.attempts < this.bestAttempts || this.bestAttempts === Infinity) {
            this.bestAttempts = this.attempts;
            localStorage.setItem('memory-best-attempts', this.bestAttempts);
            this.bestAttemptsElement.textContent = this.bestAttempts;
        }
        
        // Сохраняем статистику
        if (window.app) {
            window.app.saveGameStats('memory', this.attempts, gameTime);
        }
        
        this.showOverlay('win');
        this.createWinEffect();
    }
    
    restartGame() {
        this.gameRunning = false;
        this.stopTimer();
        this.showOverlay('start');
    }
    
    resetStats() {
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.attempts = 0;
        this.startTime = Date.now();
        this.canFlip = true;
        this.updateStats();
    }
    
    updateStats() {
        this.attemptsElement.textContent = this.attempts;
        this.pairsElement.textContent = `${this.matchedPairs} / ${this.totalPairs}`;
        
        this.attemptsElement.classList.add('score-animation');
        setTimeout(() => {
            this.attemptsElement.classList.remove('score-animation');
        }, 300);
    }
    
    loadBestScore() {
        this.bestAttempts = parseInt(localStorage.getItem('memory-best-attempts') || 'Infinity');
        this.bestAttemptsElement.textContent = this.bestAttempts === Infinity ? '∞' : this.bestAttempts;
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
                this.gameMessage.textContent = 'Тренировка памяти';
                this.gameSubmessage.textContent = 'Найдите все пары одинаковых карточек';
                this.startButton.textContent = 'Начать игру';
                break;
            case 'win':
                this.gameMessage.textContent = 'Отлично! 🎉';
                this.gameSubmessage.textContent = `Все пары найдены за ${this.attempts} попыток`;
                this.startButton.textContent = 'Играть снова';
                break;
        }
        
        this.overlay.classList.add('active');
    }
    
    hideOverlay() {
        this.overlay.classList.remove('active');
    }
    
    createMatchEffect(firstElement, secondElement) {
        // Создаем эффект частиц для совпадения
        const elements = [firstElement, secondElement];
        
        elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            for (let i = 0; i < 6; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.position = 'fixed';
                particle.style.left = centerX + 'px';
                particle.style.top = centerY + 'px';
                particle.style.setProperty('--random-x', (Math.random() - 0.5) * 100 + 'px');
                particle.style.setProperty('--random-y', -Math.random() * 100 - 50 + 'px');
                particle.style.background = '#f093fb';
                particle.style.width = '6px';
                particle.style.height = '6px';
                particle.style.zIndex = '1000';
                
                document.body.appendChild(particle);
                
                setTimeout(() => {
                    particle.remove();
                }, 1000);
            }
        });
    }
    
    createWinEffect() {
        // Создаем эффект победы
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * window.innerWidth + 'px';
            particle.style.top = Math.random() * window.innerHeight + 'px';
            particle.style.setProperty('--random-x', (Math.random() - 0.5) * 400 + 'px');
            particle.style.setProperty('--random-y', -Math.random() * 400 - 200 + 'px');
            particle.style.background = this.cardSymbols[Math.floor(Math.random() * this.cardSymbols.length)];
            particle.style.width = '20px';
            particle.style.height = '20px';
            particle.style.fontSize = '16px';
            particle.style.display = 'flex';
            particle.style.alignItems = 'center';
            particle.style.justifyContent = 'center';
            particle.style.borderRadius = '50%';
            particle.style.backgroundColor = '#f093fb';
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 2000);
        }
        
        // Анимация доски
        this.board.classList.add('game-over-animation');
        setTimeout(() => {
            this.board.classList.remove('game-over-animation');
        }, 500);
    }
}

// Инициализация игры
let memoryGame;
document.addEventListener('DOMContentLoaded', () => {
    memoryGame = new MemoryGame();
});
