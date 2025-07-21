const rows = 20;
const cols = 20;
const game = document.getElementById('game');
const historyBoard = document.getElementById('history-board');
const realtimeBoard = document.getElementById('realtime-board');
const cells = [];

let username = '';
let snake = [{ x: 10, y: 10 }];
let direction = 'right';
let pendingDirection = 'right';
let food = { x: 5, y: 5 };
let interval;
let paused = false;

// 玩家数据结构：{ username: { max: 历史最大, current: 当前 } }
function getPlayersData() {
    return JSON.parse(localStorage.getItem('snake_players') || '{}');
}
function setPlayersData(data) {
    localStorage.setItem('snake_players', JSON.stringify(data));
}

// 用户名输入
function askUsername() {
    let name = localStorage.getItem('snake_username') || '';
    while (!name) {
        name = prompt('请输入你的用户名（仅用于排行榜显示）');
        if (name) {
            name = name.trim();
        }
    }
    localStorage.setItem('snake_username', name);
    return name;
}

// 更新排行榜
function updateBoards() {
    const data = getPlayersData();
    // 历史排行榜
    let historyArr = Object.entries(data)
        .map(([user, obj]) => ({ user, max: obj.max || 0 }))
        .sort((a, b) => b.max - a.max)
        .slice(0, 10);
    historyBoard.innerHTML = `<b>历史长度榜</b><hr style="margin:4px 0;">` +
        historyArr.map((item, i) =>
            `<div>${i + 1}. ${item.user}：${item.max}</div>`
        ).join('') || '<div>暂无数据</div>';

    // 实时最大长度
    let realtimeArr = Object.entries(data)
        .map(([user, obj]) => ({ user, current: obj.current || 0 }))
        .sort((a, b) => b.current - a.current)
        .slice(0, 10);
    realtimeBoard.innerHTML = `<b>实时最大长度</b><hr style="margin:4px 0;">` +
        realtimeArr.map((item, i) =>
            `<div>${i + 1}. ${item.user}：${item.current}</div>`
        ).join('') || '<div>暂无数据</div>';
}

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
            cells[r][c].innerHTML = '';
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

    // 每次绘制都刷新排行榜
    updateBoards();
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
        // 吃到食物，更新实时长度和历史最大长度
        updatePlayerLength(snake.length);
    } else {
        snake.pop();
        updatePlayerLength(snake.length);
    }

    draw();
}

// 更新玩家长度
function updatePlayerLength(len) {
    const data = getPlayersData();
    if (!data[username]) data[username] = { max: 0, current: 0 };
    data[username].current = len;
    if (len > data[username].max) {
        data[username].max = len;
    }
    setPlayersData(data);
}

// 死亡时清空实时长度
function gameOver() {
    clearInterval(interval);
    paused = false;
    showPauseOverlay(false);
    alert('游戏结束！点击确定重新开始');
    // 清空实时长度
    const data = getPlayersData();
    if (data[username]) data[username].current = 0;
    setPlayersData(data);
    updateBoards();
    initGame();
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
    // 清空实时长度
    const data = getPlayersData();
    if (data[username]) data[username].current = 0;
    setPlayersData(data);
    updateBoards();
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
    // 初始化时也刷新实时长度
    updatePlayerLength(snake.length);
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

// 游戏启动
window.onload = function () {
    username = askUsername();
    initGame();
};