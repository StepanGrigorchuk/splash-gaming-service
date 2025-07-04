// Стратегическая игра "Стратегический Форпост"
class StrategyGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.minimapCanvas = document.getElementById('minimapCanvas');
        this.minimapCtx = this.minimapCanvas.getContext('2d');
        
        // Проверяем, что canvas найден
        if (!this.canvas || !this.minimapCanvas) {
            console.error('Canvas не найден!');
            return;
        }
        
        // Элементы интерфейса
        this.overlay = document.getElementById('gameOverlay');
        this.coinsElement = document.getElementById('coins');
        this.bricksElement = document.getElementById('bricks');
        this.turnNumberElement = document.getElementById('turnNumber');
        this.endTurnBtn = document.getElementById('endTurnBtn');
        this.startGameBtn = document.getElementById('startGameBtn');
        this.tutorialBtn = document.getElementById('tutorialBtn');
        
        // Игровые переменные
        this.gameState = 'menu'; // menu, playing, gameOver
        this.currentTurn = 1;
        this.currentPlayer = 'player'; // player, ai
        this.gameBoard = [];
        this.mapSize = 32; // Упрощенная версия 32x32 вместо 256x256
        this.viewportSize = 20;
        this.cellSize = 30;
        
        // Ресурсы
        this.playerResources = { coins: 30, bricks: 30 };
        this.aiResources = { coins: 30, bricks: 30 };
        
        // Камера
        this.camera = { x: 0, y: 0, zoom: 1 };
        
        // Выбранный элемент
        this.selectedBuilding = null;
        this.selectedUnit = null;
        this.buildingMode = null;
        this.unitMode = null;
        
        // Структуры данных
        this.buildings = [];
        this.units = [];
        this.resourcePoints = [];
        
        // Типы зданий
        this.buildingTypes = {
            market: { name: 'Рынок', cost: { coins: 0, bricks: 20 }, produces: { coins: 2, bricks: 0 }, buildTime: 1 },
            factory: { name: 'Завод', cost: { coins: 20, bricks: 0 }, produces: { coins: 0, bricks: 2 }, buildTime: 1 },
            barracks: { name: 'Казарма', cost: { coins: 40, bricks: 40 }, produces: { coins: 0, bricks: 0 }, buildTime: 2 },
            wall: { name: 'Стена', cost: { coins: 0, bricks: 10 }, produces: { coins: 0, bricks: 0 }, buildTime: 1 }
        };
        
        // Типы юнитов
        this.unitTypes = {
            soldier: { name: 'Солдат', cost: { coins: 10, bricks: 10 }, movement: 4, buildTime: 1 },
            scout: { name: 'Разведчик', cost: { coins: 5, bricks: 5 }, movement: 8, buildTime: 1 }
        };
        
        this.init();
    }
    
    init() {
        this.setupTheme();
        this.initializeBoard();
        this.bindEvents();
        this.showOverlay();
        this.generateResourcePoints();
        this.updateUI();
    }
    
    setupTheme() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        this.colors = {
            background: isDark ? '#1a202c' : '#f8fafc',
            gridLine: isDark ? '#374151' : '#e5e7eb',
            playerColor: isDark ? '#3b82f6' : '#2563eb',
            aiColor: isDark ? '#ef4444' : '#dc2626',
            selectedColor: isDark ? '#fbbf24' : '#f59e0b',
            resourceColor: isDark ? '#10b981' : '#059669',
            textColor: isDark ? '#f9fafb' : '#111827',
            buildingColors: {
                market: isDark ? '#f59e0b' : '#d97706',
                factory: isDark ? '#8b5cf6' : '#7c3aed',
                barracks: isDark ? '#ef4444' : '#dc2626',
                wall: isDark ? '#6b7280' : '#4b5563'
            }
        };
    }
    
    initializeBoard() {
        this.gameBoard = [];
        for (let y = 0; y < this.mapSize; y++) {
            this.gameBoard[y] = [];
            for (let x = 0; x < this.mapSize; x++) {
                this.gameBoard[y][x] = {
                    x: x,
                    y: y,
                    building: null,
                    unit: null,
                    resource: null,
                    owner: null
                };
            }
        }
    }
    
    generateResourcePoints() {
        // Генерируем случайные ресурсные точки
        const resourceCount = 8;
        this.resourcePoints = [];
        
        for (let i = 0; i < resourceCount; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * this.mapSize);
                y = Math.floor(Math.random() * this.mapSize);
            } while (this.gameBoard[y][x].resource !== null);
            
            const resourceType = Math.random() < 0.5 ? 'coins' : 'bricks';
            this.resourcePoints.push({
                x: x,
                y: y,
                type: resourceType,
                owner: null
            });
            
            this.gameBoard[y][x].resource = {
                type: resourceType,
                owner: null
            };
        }
    }
    
    bindEvents() {
        // Кнопки
        this.startGameBtn.addEventListener('click', () => this.startGame());
        this.tutorialBtn.addEventListener('click', () => this.showTutorial());
        this.endTurnBtn.addEventListener('click', () => this.endTurn());
        
        // Кнопки зданий
        document.querySelectorAll('.building-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const buildingType = e.currentTarget.dataset.building;
                this.selectBuilding(buildingType);
            });
        });
        
        // Кнопки юнитов
        document.querySelectorAll('.unit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const unitType = e.currentTarget.dataset.unit;
                this.selectUnit(unitType);
            });
        });
        
        // Canvas события
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        
        // Миникарта
        this.minimapCanvas.addEventListener('click', (e) => this.handleMinimapClick(e));
        
        // Тема
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                setTimeout(() => this.setupTheme(), 100);
                this.render();
            });
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        this.hideOverlay();
        this.currentTurn = 1;
        this.currentPlayer = 'player';
        this.updateUI();
        this.render();
    }
    
    showTutorial() {
        alert('Обучение:\n\n1. Стройте здания для получения ресурсов\n2. Создавайте юнитов в казармах\n3. Захватывайте ресурсные точки\n4. Уничтожайте здания врага для победы\n\nУправление:\n- Клик для выбора\n- Колесо мыши для масштабирования\n- Перетаскивание для перемещения карты');
    }
    
    selectBuilding(buildingType) {
        if (this.currentPlayer !== 'player') return;
        
        this.buildingMode = buildingType;
        this.unitMode = null;
        this.selectedBuilding = null;
        this.selectedUnit = null;
        
        // Обновляем визуальное выделение кнопок
        document.querySelectorAll('.building-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-building="${buildingType}"]`).classList.add('active');
        
        this.canvas.style.cursor = 'crosshair';
    }
    
    selectUnit(unitType) {
        if (this.currentPlayer !== 'player') return;
        
        this.unitMode = unitType;
        this.buildingMode = null;
        this.selectedBuilding = null;
        this.selectedUnit = null;
        
        // Обновляем визуальное выделение кнопок
        document.querySelectorAll('.unit-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-unit="${unitType}"]`).classList.add('active');
        
        this.canvas.style.cursor = 'crosshair';
    }
    
    handleCanvasClick(e) {
        if (this.gameState !== 'playing' || this.currentPlayer !== 'player') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const worldPos = this.screenToWorld(x, y);
        const gridX = Math.floor(worldPos.x / this.cellSize);
        const gridY = Math.floor(worldPos.y / this.cellSize);
        
        if (gridX < 0 || gridX >= this.mapSize || gridY < 0 || gridY >= this.mapSize) return;
        
        const cell = this.gameBoard[gridY][gridX];
        
        if (this.buildingMode) {
            this.placeBuildingAt(gridX, gridY, this.buildingMode);
        } else if (this.unitMode) {
            this.placeUnitAt(gridX, gridY, this.unitMode);
        } else {
            // Выбор существующего здания или юнита
            if (cell.building && cell.building.owner === 'player') {
                this.selectedBuilding = cell.building;
                this.selectedUnit = null;
            } else if (cell.unit && cell.unit.owner === 'player') {
                this.selectedUnit = cell.unit;
                this.selectedBuilding = null;
            } else {
                this.selectedBuilding = null;
                this.selectedUnit = null;
            }
        }
        
        this.render();
    }
    
    placeBuildingAt(x, y, buildingType) {
        const cell = this.gameBoard[y][x];
        const buildingData = this.buildingTypes[buildingType];
        
        // Проверяем, можно ли построить здание
        if (cell.building || cell.unit) {
            this.showMessage('Клетка занята!');
            return;
        }
        
        // Проверяем ресурсы
        if (this.playerResources.coins < buildingData.cost.coins || 
            this.playerResources.bricks < buildingData.cost.bricks) {
            this.showMessage('Недостаточно ресурсов!');
            return;
        }
        
        // Тратим ресурсы
        this.playerResources.coins -= buildingData.cost.coins;
        this.playerResources.bricks -= buildingData.cost.bricks;
        
        // Создаем здание
        const building = {
            type: buildingType,
            x: x,
            y: y,
            owner: 'player',
            buildTime: buildingData.buildTime,
            turnsLeft: buildingData.buildTime
        };
        
        cell.building = building;
        this.buildings.push(building);
        
        this.buildingMode = null;
        this.canvas.style.cursor = 'grab';
        this.updateUI();
        this.updateButtonStates();
    }
    
    placeUnitAt(x, y, unitType) {
        const cell = this.gameBoard[y][x];
        const unitData = this.unitTypes[unitType];
        
        // Проверяем, есть ли казарма игрока
        const barracks = this.buildings.filter(b => b.type === 'barracks' && b.owner === 'player' && b.turnsLeft === 0);
        if (barracks.length === 0) {
            this.showMessage('Нужна построенная казарма!');
            return;
        }
        
        // Проверяем, можно ли разместить юнит рядом с казармой
        let canPlace = false;
        for (const barrack of barracks) {
            if (Math.abs(barrack.x - x) <= 1 && Math.abs(barrack.y - y) <= 1) {
                canPlace = true;
                break;
            }
        }
        
        if (!canPlace) {
            this.showMessage('Юнит должен быть рядом с казармой!');
            return;
        }
        
        // Проверяем, свободна ли клетка
        if (cell.building || cell.unit) {
            this.showMessage('Клетка занята!');
            return;
        }
        
        // Проверяем ресурсы
        if (this.playerResources.coins < unitData.cost.coins || 
            this.playerResources.bricks < unitData.cost.bricks) {
            this.showMessage('Недостаточно ресурсов!');
            return;
        }
        
        // Тратим ресурсы
        this.playerResources.coins -= unitData.cost.coins;
        this.playerResources.bricks -= unitData.cost.bricks;
        
        // Создаем юнит
        const unit = {
            type: unitType,
            x: x,
            y: y,
            owner: 'player',
            movement: unitData.movement,
            movementLeft: unitData.movement
        };
        
        cell.unit = unit;
        this.units.push(unit);
        
        this.unitMode = null;
        this.canvas.style.cursor = 'grab';
        this.updateUI();
        this.updateButtonStates();
    }
    
    endTurn() {
        if (this.currentPlayer === 'player') {
            this.processPlayerTurn();
            this.currentPlayer = 'ai';
            this.processAITurn();
            this.currentPlayer = 'player';
            this.currentTurn++;
            this.resetUnitsMovement();
        }
        
        this.updateUI();
        this.render();
        this.checkWinCondition();
    }
    
    processPlayerTurn() {
        // Обрабатываем строительство зданий
        this.buildings.forEach(building => {
            if (building.owner === 'player' && building.turnsLeft > 0) {
                building.turnsLeft--;
            }
        });
        
        // Собираем ресурсы
        this.buildings.forEach(building => {
            if (building.owner === 'player' && building.turnsLeft === 0) {
                const buildingData = this.buildingTypes[building.type];
                this.playerResources.coins = Math.min(100, this.playerResources.coins + buildingData.produces.coins);
                this.playerResources.bricks = Math.min(100, this.playerResources.bricks + buildingData.produces.bricks);
            }
        });
        
        // Собираем ресурсы с точек
        this.resourcePoints.forEach(point => {
            if (point.owner === 'player') {
                if (point.type === 'coins') {
                    this.playerResources.coins = Math.min(100, this.playerResources.coins + 1);
                } else {
                    this.playerResources.bricks = Math.min(100, this.playerResources.bricks + 1);
                }
            }
        });
    }
    
    processAITurn() {
        // Простой ИИ - строит случайные здания
        const aiMoves = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < aiMoves; i++) {
            this.makeAIMove();
        }
        
        // Обрабатываем ИИ здания
        this.buildings.forEach(building => {
            if (building.owner === 'ai' && building.turnsLeft > 0) {
                building.turnsLeft--;
            }
        });
        
        // Собираем ресурсы ИИ
        this.buildings.forEach(building => {
            if (building.owner === 'ai' && building.turnsLeft === 0) {
                const buildingData = this.buildingTypes[building.type];
                this.aiResources.coins = Math.min(100, this.aiResources.coins + buildingData.produces.coins);
                this.aiResources.bricks = Math.min(100, this.aiResources.bricks + buildingData.produces.bricks);
            }
        });
    }
    
    makeAIMove() {
        // Простая логика ИИ
        const buildingTypes = Object.keys(this.buildingTypes);
        const chosenType = buildingTypes[Math.floor(Math.random() * buildingTypes.length)];
        const buildingData = this.buildingTypes[chosenType];
        
        // Проверяем, может ли ИИ построить здание
        if (this.aiResources.coins >= buildingData.cost.coins && 
            this.aiResources.bricks >= buildingData.cost.bricks) {
            
            // Ищем свободное место
            for (let attempts = 0; attempts < 10; attempts++) {
                const x = Math.floor(Math.random() * this.mapSize);
                const y = Math.floor(Math.random() * this.mapSize);
                const cell = this.gameBoard[y][x];
                
                if (!cell.building && !cell.unit) {
                    // Тратим ресурсы ИИ
                    this.aiResources.coins -= buildingData.cost.coins;
                    this.aiResources.bricks -= buildingData.cost.bricks;
                    
                    // Создаем здание ИИ
                    const building = {
                        type: chosenType,
                        x: x,
                        y: y,
                        owner: 'ai',
                        buildTime: buildingData.buildTime,
                        turnsLeft: buildingData.buildTime
                    };
                    
                    cell.building = building;
                    this.buildings.push(building);
                    break;
                }
            }
        }
    }
    
    resetUnitsMovement() {
        this.units.forEach(unit => {
            unit.movementLeft = this.unitTypes[unit.type].movement;
        });
    }
    
    checkWinCondition() {
        const playerBuildings = this.buildings.filter(b => b.owner === 'player');
        const aiBuildings = this.buildings.filter(b => b.owner === 'ai');
        
        if (playerBuildings.length === 0) {
            this.gameOver('ai');
        } else if (aiBuildings.length === 0) {
            this.gameOver('player');
        }
    }
    
    gameOver(winner) {
        this.gameState = 'gameOver';
        const message = winner === 'player' ? 'Вы победили!' : 'Вы проиграли!';
        this.showOverlay(message);
    }
    
    showMessage(message) {
        // Простое уведомление
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--accent);
            color: white;
            padding: 1rem;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    updateUI() {
        this.coinsElement.textContent = this.playerResources.coins;
        this.bricksElement.textContent = this.playerResources.bricks;
        this.turnNumberElement.textContent = `Ход ${this.currentTurn}`;
        this.endTurnBtn.disabled = this.currentPlayer !== 'player';
        this.updateButtonStates();
    }
    
    updateButtonStates() {
        // Обновляем состояние кнопок зданий
        document.querySelectorAll('.building-btn').forEach(btn => {
            const buildingType = btn.dataset.building;
            const buildingData = this.buildingTypes[buildingType];
            const canAfford = this.playerResources.coins >= buildingData.cost.coins && 
                            this.playerResources.bricks >= buildingData.cost.bricks;
            
            btn.classList.toggle('disabled', !canAfford);
        });
        
        // Обновляем состояние кнопок юнитов
        document.querySelectorAll('.unit-btn').forEach(btn => {
            const unitType = btn.dataset.unit;
            const unitData = this.unitTypes[unitType];
            const canAfford = this.playerResources.coins >= unitData.cost.coins && 
                            this.playerResources.bricks >= unitData.cost.bricks;
            const hasBarracks = this.buildings.some(b => b.type === 'barracks' && b.owner === 'player' && b.turnsLeft === 0);
            
            btn.classList.toggle('disabled', !canAfford || !hasBarracks);
        });
    }
    
    // Обработчики мыши для камеры
    handleMouseDown(e) {
        if (this.buildingMode || this.unitMode) return;
        
        this.isDragging = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        this.canvas.style.cursor = 'grabbing';
    }
    
    handleMouseMove(e) {
        if (!this.isDragging) return;
        
        const deltaX = e.clientX - this.lastMouseX;
        const deltaY = e.clientY - this.lastMouseY;
        
        this.camera.x -= deltaX / this.camera.zoom;
        this.camera.y -= deltaY / this.camera.zoom;
        
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        
        this.render();
    }
    
    handleMouseUp(e) {
        this.isDragging = false;
        this.canvas.style.cursor = 'grab';
    }
    
    handleWheel(e) {
        e.preventDefault();
        const zoomSpeed = 0.1;
        const oldZoom = this.camera.zoom;
        
        if (e.deltaY > 0) {
            this.camera.zoom = Math.max(0.5, this.camera.zoom - zoomSpeed);
        } else {
            this.camera.zoom = Math.min(3, this.camera.zoom + zoomSpeed);
        }
        
        this.render();
    }
    
    handleMinimapClick(e) {
        const rect = this.minimapCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const worldX = (x / this.minimapCanvas.width) * this.mapSize * this.cellSize;
        const worldY = (y / this.minimapCanvas.height) * this.mapSize * this.cellSize;
        
        this.camera.x = worldX - this.canvas.width / 2;
        this.camera.y = worldY - this.canvas.height / 2;
        
        this.render();
    }
    
    screenToWorld(screenX, screenY) {
        return {
            x: (screenX / this.camera.zoom) + this.camera.x,
            y: (screenY / this.camera.zoom) + this.camera.y
        };
    }
    
    worldToScreen(worldX, worldY) {
        return {
            x: (worldX - this.camera.x) * this.camera.zoom,
            y: (worldY - this.camera.y) * this.camera.zoom
        };
    }
    
    render() {
        this.renderMainView();
        this.renderMinimap();
    }
    
    renderMainView() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Фон
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.save();
        this.ctx.scale(this.camera.zoom, this.camera.zoom);
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Рисуем сетку
        this.drawGrid();
        
        // Рисуем ресурсные точки
        this.drawResourcePoints();
        
        // Рисуем здания
        this.drawBuildings();
        
        // Рисуем юниты
        this.drawUnits();
        
        // Рисуем выделения
        this.drawSelections();
        
        this.ctx.restore();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = this.colors.gridLine;
        this.ctx.lineWidth = 1;
        
        const startX = Math.floor(this.camera.x / this.cellSize) * this.cellSize;
        const startY = Math.floor(this.camera.y / this.cellSize) * this.cellSize;
        const endX = startX + this.canvas.width / this.camera.zoom + this.cellSize;
        const endY = startY + this.canvas.height / this.camera.zoom + this.cellSize;
        
        for (let x = startX; x <= endX; x += this.cellSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, endY);
            this.ctx.stroke();
        }
        
        for (let y = startY; y <= endY; y += this.cellSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(endX, y);
            this.ctx.stroke();
        }
    }
    
    drawResourcePoints() {
        this.resourcePoints.forEach(point => {
            const x = point.x * this.cellSize;
            const y = point.y * this.cellSize;
            
            this.ctx.fillStyle = this.colors.resourceColor;
            this.ctx.fillRect(x + 5, y + 5, this.cellSize - 10, this.cellSize - 10);
            
            // Иконка ресурса
            this.ctx.fillStyle = point.type === 'coins' ? '#f59e0b' : '#8b5cf6';
            this.ctx.fillRect(x + 10, y + 10, this.cellSize - 20, this.cellSize - 20);
        });
    }
    
    drawBuildings() {
        this.buildings.forEach(building => {
            const x = building.x * this.cellSize;
            const y = building.y * this.cellSize;
            
            const color = building.owner === 'player' ? this.colors.playerColor : this.colors.aiColor;
            const buildingColor = this.colors.buildingColors[building.type];
            
            // Основа здания
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
            
            // Тип здания
            this.ctx.fillStyle = buildingColor;
            this.ctx.fillRect(x + 6, y + 6, this.cellSize - 12, this.cellSize - 12);
            
            // Индикатор строительства
            if (building.turnsLeft > 0) {
                this.ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
                this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
            }
        });
    }
    
    drawUnits() {
        this.units.forEach(unit => {
            const x = unit.x * this.cellSize;
            const y = unit.y * this.cellSize;
            
            const color = unit.owner === 'player' ? this.colors.playerColor : this.colors.aiColor;
            
            // Юнит как круг
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(x + this.cellSize / 2, y + this.cellSize / 2, this.cellSize / 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Тип юнита
            this.ctx.fillStyle = unit.type === 'soldier' ? '#dc2626' : '#059669';
            this.ctx.beginPath();
            this.ctx.arc(x + this.cellSize / 2, y + this.cellSize / 2, this.cellSize / 6, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawSelections() {
        if (this.selectedBuilding) {
            const x = this.selectedBuilding.x * this.cellSize;
            const y = this.selectedBuilding.y * this.cellSize;
            
            this.ctx.strokeStyle = this.colors.selectedColor;
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
        }
        
        if (this.selectedUnit) {
            const x = this.selectedUnit.x * this.cellSize;
            const y = this.selectedUnit.y * this.cellSize;
            
            this.ctx.strokeStyle = this.colors.selectedColor;
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
        }
    }
    
    renderMinimap() {
        this.minimapCtx.clearRect(0, 0, this.minimapCanvas.width, this.minimapCanvas.height);
        
        // Фон миникарты
        this.minimapCtx.fillStyle = this.colors.background;
        this.minimapCtx.fillRect(0, 0, this.minimapCanvas.width, this.minimapCanvas.height);
        
        const scaleX = this.minimapCanvas.width / this.mapSize;
        const scaleY = this.minimapCanvas.height / this.mapSize;
        
        // Рисуем здания на миникарте
        this.buildings.forEach(building => {
            const x = building.x * scaleX;
            const y = building.y * scaleY;
            
            this.minimapCtx.fillStyle = building.owner === 'player' ? this.colors.playerColor : this.colors.aiColor;
            this.minimapCtx.fillRect(x, y, scaleX, scaleY);
        });
        
        // Рисуем ресурсные точки на миникарте
        this.resourcePoints.forEach(point => {
            const x = point.x * scaleX;
            const y = point.y * scaleY;
            
            this.minimapCtx.fillStyle = this.colors.resourceColor;
            this.minimapCtx.fillRect(x, y, scaleX, scaleY);
        });
        
        // Рисуем область просмотра
        const viewX = (this.camera.x / this.cellSize) * scaleX;
        const viewY = (this.camera.y / this.cellSize) * scaleY;
        const viewW = (this.canvas.width / this.camera.zoom / this.cellSize) * scaleX;
        const viewH = (this.canvas.height / this.camera.zoom / this.cellSize) * scaleY;
        
        this.minimapCtx.strokeStyle = this.colors.selectedColor;
        this.minimapCtx.lineWidth = 2;
        this.minimapCtx.strokeRect(viewX, viewY, viewW, viewH);
    }
    
    showOverlay(message = null) {
        this.overlay.classList.add('active');
        if (message) {
            document.getElementById('overlayTitle').textContent = message;
            document.getElementById('overlayMessage').textContent = '';
        }
    }
    
    hideOverlay() {
        this.overlay.classList.remove('active');
    }
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    new StrategyGame();
});
