const rows = 20;
const cols = 20;
const game = document.getElementById('game');
const cells = [];

let snake = [{ x: 10, y: 10 }];
let direction = 'right';
let pendingDirection = 'right';
let food = { x: 5, y: 5 };
let interval;
let paused = false;

// 创建格子
for (let r = 0; r < rows; r++) {
    cells[r] = [];
    for (let c = 0; c < cols; c++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        game.appendChild(cell);
        cells[r][c] = cell;
    }
}

function draw() {
    // 清空
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            cells[r][c].className = 'cell';
        }
    }

    // 绘制食物（苹果风格：有阴影和高光）
    const foodCell = cells[food.y][food.x];
    foodCell.classList.add('food');
    foodCell.innerHTML = `
        <div class="food-apple">
            <div class="food-highlight"></div>
            <div class="food-leaf"></div>
        </div>
    `;

    // 绘制蛇
    for (let i = 0; i < snake.length; i++) {
        const part = snake[i];
        const cell = cells[part.y][part.x];
        cell.classList.add('snake');
        cell.innerHTML = '';
        // 蛇头特殊样式
        if (i === 0) {
            cell.classList.add('snake-head');
            cell.innerHTML = `<div class="snake-eye left"></div><div class="snake-eye right"></div>`;
        } else if (i === snake.length - 1) {
            cell.classList.add('snake-tail');
        }
    }
}

function move() {
    if (paused) return;

    const opposites = {
        up: 'down',
        down: 'up',
        left: 'right',
        right: 'left'
    };
    if (pendingDirection !== opposites[direction]) {
        direction = pendingDirection;
    }

    const head = { ...snake[0] };

    switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }

    // 撞墙
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
        gameOver();
        return;
    }

    // 撞自己
    if (snake.some(p => p.x === head.x && p.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // 吃到食物
    if (head.x === food.x && head.y === food.y) {
        placeFood();
    } else {
        snake.pop();
    }

    draw();
}

function placeFood() {
    let x, y;
    do {
        x = Math.floor(Math.random() * cols);
        y = Math.floor(Math.random() * rows);
    } while (snake.some(p => p.x === x && p.y === y));
    food = { x, y };
}

function changeDirection(dir) {
    pendingDirection = dir;
}

function gameOver() {
    clearInterval(interval);
    paused = false;
    showPauseOverlay(false);
    alert('游戏结束！点击确定重新开始');
    initGame();
}

function initGame() {
    snake = [{ x: 10, y: 10 }];
    direction = 'right';
    pendingDirection = 'right';
    paused = false;
    showPauseOverlay(false);
    placeFood();
    draw();
    clearInterval(interval);
    interval = setInterval(move, 200);
}

// 暂停相关
function pauseGame() {
    if (!paused) {
        clearInterval(interval);
        paused = true;
        showPauseOverlay(true);
    }
}

function resumeGame() {
    if (paused) {
        interval = setInterval(move, 200);
        paused = false;
        showPauseOverlay(false);
    }
}

function togglePause() {
    if (paused) {
        resumeGame();
    } else {
        pauseGame();
    }
}

// 暂停遮罩层
function showPauseOverlay(show) {
    let overlay = document.getElementById('pause-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'pause-overlay';
        overlay.style.position = 'fixed';
        overlay.style.left = 0;
        overlay.style.top = 0;
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(245,245,247,0.85)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = 9999;
        overlay.style.fontSize = '2rem';
        overlay.style.color = '#222';
        overlay.innerText = '已暂停';
        document.body.appendChild(overlay);
    }
    overlay.style.display = show ? 'flex' : 'none';
}

// 键盘控制
document.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        togglePause();
        return;
    }
    if (paused) return;
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            changeDirection('up');
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            changeDirection('down');
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            changeDirection('left');
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            changeDirection('right');
            break;
    }
});

// 移动端暂停按钮
function createPauseButton() {
    let controls = document.getElementById('controls');
    if (!controls) {
        controls = document.createElement('div');
        controls.id = 'controls';
        controls.style.marginTop = '24px';
        controls.style.textAlign = 'center';
        document.body.appendChild(controls);
    }
    let pauseBtn = document.getElementById('pause-btn');
    if (!pauseBtn) {
        pauseBtn = document.createElement('button');
        pauseBtn.id = 'pause-btn';
        pauseBtn.className = 'btn';
        pauseBtn.innerText = '⏸️ 暂停';
        pauseBtn.style.fontSize = '20px';
        pauseBtn.style.width = '120px';
        pauseBtn.style.height = '48px';
        controls.appendChild(pauseBtn);
        pauseBtn.addEventListener('click', togglePause);
    }
}
createPauseButton();

initGame();