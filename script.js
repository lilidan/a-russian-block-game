// Game constants
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = [
    null,
    '#00f0f0', // I
    '#0000f0', // J
    '#f0a000', // L
    '#f0f000', // O
    '#00f000', // S
    '#a000f0', // T
    '#f00000'  // Z
];

// Tetromino shapes
const SHAPES = [
    null,
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
    [[2, 0, 0], [2, 2, 2], [0, 0, 0]], // J
    [[0, 0, 3], [3, 3, 3], [0, 0, 0]], // L
    [[4, 4], [4, 4]], // O
    [[0, 5, 5], [5, 5, 0], [0, 0, 0]], // S
    [[0, 6, 0], [6, 6, 6], [0, 0, 0]], // T
    [[7, 7, 0], [0, 7, 7], [0, 0, 0]]  // Z
];

// Game variables
let canvas, ctx;
let board = [];
let gameOver = false;
let paused = false;
let score = 0;
let level = 1;
let lines = 0;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0
};
let nextPiece = null;

// DOM elements
const boardElement = document.getElementById('board');
const nextPieceElement = document.getElementById('next-piece');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');
const finalScoreElement = document.getElementById('final-score');
const gameOverElement = document.getElementById('game-over');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');
const restartButton = document.getElementById('restart-button');

// Initialize the game board
function createBoard() {
    boardElement.innerHTML = '';
    for (let y = 0; y < ROWS; y++) {
        board[y] = [];
        for (let x = 0; x < COLS; x++) {
            board[y][x] = 0;
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = y;
            cell.dataset.col = x;
            boardElement.appendChild(cell);
        }
    }
}

// Create the next piece preview
function createNextPieceBoard() {
    nextPieceElement.innerHTML = '';
    for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = y;
            cell.dataset.col = x;
            nextPieceElement.appendChild(cell);
        }
    }
}

// Create a new piece
function createPiece(type) {
    return SHAPES[type].map(row => [...row]);
}

// Get a random piece
function getRandomPiece() {
    const pieces = 'IJLOSTZ';
    const rand = Math.floor(Math.random() * pieces.length);
    return createPiece(pieces[rand]);
}

// Draw the board
function drawBoard() {
    // Clear the board
    const cells = boardElement.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.className = 'cell';
    });
    
    // Draw the placed pieces
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                const cell = boardElement.querySelector(`.cell[data-row="${y}"][data-col="${x}"]`);
                cell.classList.add('filled');
                cell.classList.add(getPieceClass(board[y][x]));
            }
        }
    }
}

// Draw the current piece
function drawPiece() {
    if (!player.matrix) return;
    
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                const boardY = y + player.pos.y;
                const boardX = x + player.pos.x;
                if (boardY >= 0) {
                    const cell = boardElement.querySelector(`.cell[data-row="${boardY}"][data-col="${boardX}"]`);
                    if (cell) {
                        cell.classList.add('filled');
                        cell.classList.add(getPieceClass(value));
                    }
                }
            }
        });
    });
}

// Draw the next piece preview
function drawNextPiece(nextPiece) {
    const cells = nextPieceElement.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.className = 'cell';
    });
    
    if (!nextPiece) return;
    
    nextPiece.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                const cell = nextPieceElement.querySelector(`.cell[data-row="${y}"][data-col="${x}"]`);
                if (cell) {
                    cell.classList.add('filled');
                    cell.classList.add(getPieceClass(value));
                }
            }
        });
    });
}

// Get CSS class for a piece
function getPieceClass(value) {
    const classes = ['', 'I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    return classes[value];
}

// Move the player
function playerMove(dir) {
    player.pos.x += dir;
    if (collide()) {
        player.pos.x -= dir;
    }
}

// Rotate the player piece
function playerRotate() {
    const pos = player.pos.x;
    let offset = 1;
    const originalMatrix = player.matrix.map(row => [...row]);
    rotate(player.matrix);
    while (collide()) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            player.matrix = originalMatrix;
            player.pos.x = pos;
            return;
        }
    }
}

// Rotate a matrix
function rotate(matrix) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    matrix.forEach(row => row.reverse());
}

// Check for collision
function collide() {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (board[y + o.y] &&
                board[y + o.y][x + o.x]) !== 0 ||
                y + o.y >= ROWS ||
                x + o.x < 0 ||
                x + o.x >= COLS) {
                return true;
            }
        }
    }
    return false;
}

// Merge the player piece with the board
function merge() {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                board[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

// Drop the player piece
function playerDrop() {
    player.pos.y++;
    if (collide()) {
        player.pos.y--;
        merge();
        playerReset();
        sweepRows();
        updateScore();
    }
    dropCounter = 0;
}

// Hard drop
function playerHardDrop() {
    while (!collide()) {
        player.pos.y++;
    }
    player.pos.y--;
    playerDrop();
}

// Reset the player with a new piece
function playerReset() {
    const pieces = 'IJLOSTZ';
    if (!nextPiece) {
        nextPiece = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
    }
    player.matrix = nextPiece;
    nextPiece = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
    drawNextPiece(nextPiece);
    
    player.pos.y = 0;
    player.pos.x = Math.floor(COLS / 2) - Math.floor(player.matrix[0].length / 2);
    
    if (collide()) {
        gameOver = true;
        gameOverElement.style.display = 'block';
        finalScoreElement.textContent = score;
    }
}

// Sweep completed rows
function sweepRows() {
    let rowCount = 0;
    outer: for (let y = ROWS - 1; y >= 0; --y) {
        for (let x = 0; x < COLS; ++x) {
            if (board[y][x] === 0) {
                continue outer;
            }
        }
        
        // Remove the completed row and add a new empty row at the top
        board.splice(y, 1);
        board.unshift(Array(COLS).fill(0));
        ++y;
        
        rowCount++;
    }
    
    if (rowCount > 0) {
        // Update score based on rows cleared
        const linePoints = [0, 40, 100, 300, 1200];
        score += linePoints[rowCount] * level;
        lines += rowCount;
        
        // Level up every 10 lines
        level = Math.floor(lines / 10) + 1;
        
        // Increase speed with level
        dropInterval = Math.max(100, 1000 - (level - 1) * 100);
        
        updateScore();
    }
}

// Update score display
function updateScore() {
    scoreElement.textContent = score;
    levelElement.textContent = level;
    linesElement.textContent = lines;
}

// Game loop
function update(time = 0) {
    if (gameOver || paused) return;
    
    const deltaTime = time - lastTime;
    lastTime = time;
    
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }
    
    draw();
    
    requestAnimationFrame(update);
}

// Draw everything
function draw() {
    drawBoard();
    drawPiece();
}

// Start the game
function startGame() {
    if (gameOver) {
        resetGame();
    }
    
    gameOver = false;
    paused = false;
    gameOverElement.style.display = 'none';
    
    if (!player.matrix) {
        playerReset();
    }
    
    update();
}

// Pause the game
function pauseGame() {
    paused = !paused;
    pauseButton.textContent = paused ? 'Resume' : 'Pause';
    
    if (!paused && !gameOver) {
        update();
    }
}

// Reset the game
function resetGame() {
    // Clear the board
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            board[y][x] = 0;
        }
    }
    
    // Reset game state
    score = 0;
    level = 1;
    lines = 0;
    dropInterval = 1000;
    nextPiece = null;
    player.matrix = null;
    
    updateScore();
    createNextPieceBoard();
    
    gameOver = false;
    paused = false;
    pauseButton.textContent = 'Pause';
    gameOverElement.style.display = 'none';
}

// Initialize the game
function init() {
    createBoard();
    createNextPieceBoard();
    updateScore();
    
    // Event listeners
    document.addEventListener('keydown', event => {
        if (gameOver || paused) return;
        
        switch (event.keyCode) {
            case 37: // Left arrow
                playerMove(-1);
                break;
            case 39: // Right arrow
                playerMove(1);
                break;
            case 40: // Down arrow
                playerDrop();
                break;
            case 38: // Up arrow
                playerRotate();
                break;
            case 32: // Space
                playerHardDrop();
                break;
            case 80: // P
                pauseGame();
                break;
        }
    });
    
    startButton.addEventListener('click', startGame);
    pauseButton.addEventListener('click', pauseGame);
    restartButton.addEventListener('click', () => {
        resetGame();
        startGame();
    });
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', init);