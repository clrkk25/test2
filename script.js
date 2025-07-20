const rows = 20;
  const cols = 20;
  const game = document.getElementById('game');
  const cells = [];

  let snake = [{ x: 10, y: 10 }];
  let direction = 'right';
  let food = { x: 5, y: 5 };
  let interval;

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
        cells[r][c].classList.remove('snake', 'food');
      }
    }

    // 绘制食物
    cells[food.y][food.x].classList.add('food');

    // 绘制蛇
    for (let part of snake) {
      cells[part.y][part.x].classList.add('snake');
    }
  }

  function move() {
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
    const opposites = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left'
    };
    if (dir !== opposites[direction]) {
      direction = dir;
    }
  }

  function gameOver() {
    clearInterval(interval);
    alert('游戏结束！点击确定重新开始');
    initGame();
  }

  function initGame() {
    snake = [{ x: 10, y: 10 }];
    direction = 'right';
    placeFood();
    draw();
    clearInterval(interval);
    interval = setInterval(move, 200);
  }

  // 键盘控制
  document.addEventListener('keydown', e => {
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

  initGame();