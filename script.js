const BOARD_SIZE = 8;
const board = document.getElementById('game-board');
const piecesContainer = document.getElementById('pieces-container');
const currentScoreElem = document.getElementById('current-score');
const topScoreElem = document.getElementById('top-score');
const gameOverModal = document.getElementById('game-over-modal');
const finalScoreElem = document.getElementById('final-score');

let grid = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
let currentScore = 0;
let topScore = localStorage.getItem('block_master_top_score') ? parseInt(localStorage.getItem('block_master_top_score')) : 0;

if (topScoreElem) topScoreElem.textContent = topScore;

const BLOCK_COLORS = ['#f44336', '#2196f3', '#ffeb3b', '#4caf50', '#9c27b0', '#ff9800', '#00bcd4', '#e91e63', '#8bc34a'];

// বিভিন্ন আকৃতির ব্লক বা শেপসমূহ
const SHAPES = [
  [[1]],
  [[1, 1]],
  [[1], [1]],
  [[1, 1, 1]],
  [[1], [1], [1]],
  [[1, 0], [1, 1]],
  [[0, 1], [1, 1]],
  [[1, 1], [1, 0]],
  [[1, 1], [0, 1]],
  [[1, 1], [1, 1]],
  [[1, 1, 1, 1]],
  [[1], [1], [1], [1]],
  [[1, 1, 1], [0, 1, 0]],
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
  [[1, 1, 1], [1, 1, 1]],
  [[1, 1, 1, 1], [1, 1, 1, 1]]
];

let isSoundOn = true;
let isVibrationOn = true;
let audioCtx = null;

// গ্রিড বোর্ড তৈরি
function createBoard() {
    if (!board) return;
    board.innerHTML = '';
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            
            if (grid[r][c] === 1) {
                cell.classList.add('filled');
            }

            cell.addEventListener('dragover', handleDragOver);
            cell.addEventListener('dragleave', handleDragLeave);
            cell.addEventListener('drop', handleDrop);
            board.appendChild(cell);
        }
    }
}

let draggedPieceShape = null;
let draggedPieceColor = null;
let draggedPieceElement = null;

// পিস বা ব্লক তৈরি
function createPieces() {
    if (!piecesContainer) return;
    piecesContainer.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        const piece = document.createElement('div');
        piece.classList.add('piece');
        piece.setAttribute('draggable', 'true');
        piece.style.gridTemplateColumns = `repeat(${shape[0].length}, 20px)`;

        piece.shapeData = shape;
        const randomColor = BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)];

        shape.forEach(row => {
            row.forEach(val => {
                const block = document.createElement('div');
                block.classList.add('block');
                if (val === 1) block.style.backgroundColor = randomColor;
                else block.classList.add('empty');
                piece.appendChild(block);
            });
        });

        piece.addEventListener('dragstart', (e) => {
            draggedPieceShape = shape;
            draggedPieceColor = randomColor;
            draggedPieceElement = piece;
            e.dataTransfer.setData('text/plain', '');
        });

        piece.addEventListener('click', () => handlePieceClick(shape, randomColor, piece));
        piecesContainer.appendChild(piece);
    }
    checkGameOver();
}

function handleDragOver(e) { e.preventDefault(); e.target.classList.add('drag-over'); }
function handleDragLeave(e) { e.target.classList.remove('drag-over'); }

function handleDrop(e) {
    e.preventDefault();
    e.target.classList.remove('drag-over');
    const startRow = parseInt(e.target.dataset.row);
    const startCol = parseInt(e.target.dataset.col);

    if (canPlace(draggedPieceShape, startRow, startCol)) {
        placePiece(draggedPieceShape, draggedPieceColor, startRow, startCol);
        if (draggedPieceElement) draggedPieceElement.remove();
        checkAndClearLines();
        if (piecesContainer.children.length === 0) createPieces();
        else checkGameOver();
    }
}

function handlePieceClick(shape, color, pieceEl) {
    for (let r = 0; r <= BOARD_SIZE - shape.length; r++) {
        for (let c = 0; c <= BOARD_SIZE - shape[0].length; c++) {
            if (canPlace(shape, r, c)) {
                placePiece(shape, color, r, c);
                pieceEl.remove();
                checkAndClearLines();
                if (piecesContainer.children.length === 0) createPieces();
                else checkGameOver();
                return;
            }
        }
    }
}

function canPlace(shape, startRow, startCol) {
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c] === 1) {
                const targetRow = startRow + r;
                const targetCol = startCol + c;
                if (targetRow >= BOARD_SIZE || targetCol >= BOARD_SIZE || grid[targetRow][targetCol] !== 0) {
                    return false;
                }
            }
        }
    }
    return true;
}

function placePiece(shape, color, startRow, startCol) {
    let placedBlocks = 0;
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c] === 1) {
                const targetRow = startRow + r;
                const targetCol = startCol + c;
                grid[targetRow][targetCol] = 1;
                const cell = document.querySelector(`[data-row="${targetRow}"][data-col="${targetCol}"]`);
                if (cell) {
                    cell.classList.add('filled');
                    cell.style.backgroundColor = color;
                }
                placedBlocks++;
            }
        }
    }
    updateScore(placedBlocks * 10);
}

function checkAndClearLines() {
    let rowsToClear = [];
    let colsToClear = [];

    for (let r = 0; r < BOARD_SIZE; r++) {
        if (grid[r].every(val => val === 1)) rowsToClear.push(r);
    }

    for (let c = 0; c < BOARD_SIZE; c++) {
        let full = true;
        for (let r = 0; r < BOARD_SIZE; r++) {
            if (grid[r][c] === 0) { full = false; break; }
        }
        if (full) colsToClear.push(c);
    }

    let clearedLines = rowsToClear.length + colsToClear.length;
    if (clearedLines > 0) {
        updateScore(clearedLines * 100);
    }

    rowsToClear.forEach(r => {
        for (let c = 0; c < BOARD_SIZE; c++) clearCell(r, c);
    });

    colsToClear.forEach(c => {
        for (let r = 0; r < BOARD_SIZE; r++) clearCell(r, c);
    });
}

function clearCell(r, c) {
    grid[r][c] = 0;
    const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
    if (cell) {
        cell.classList.remove('filled');
        cell.style.backgroundColor = '';
    }
}

function updateScore(points) {
    currentScore += points;
    if (currentScoreElem) currentScoreElem.textContent = currentScore;
    if (currentScore > topScore) {
        topScore = currentScore;
        if (topScoreElem) topScoreElem.textContent = topScore;
        localStorage.setItem('block_master_top_score', topScore);
    }
}

function checkGameOver() {
    const remainingPieces = Array.from(piecesContainer.children);
    if (remainingPieces.length === 0) return;

    let canMove = false;
    for (let pieceEl of remainingPieces) {
        const shape = pieceEl.shapeData;
        if (!shape) continue;

        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (canPlace(shape, r, c)) {
                    canMove = true;
                    break;
                }
            }
            if (canMove) break;
        }
        if (canMove) break;
    }

    if (!canMove) {
        if (finalScoreElem) finalScoreElem.textContent = currentScore;
        if (gameOverModal) gameOverModal.classList.add('active');
    }
}

const restartBtn = document.getElementById('restart-btn');
if (restartBtn) {
    restartBtn.onclick = restartGame;
}

function restartGame() {
    grid = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
    currentScore = 0;
    if (currentScoreElem) currentScoreElem.textContent = '0';
    if (gameOverModal) gameOverModal.classList.remove('active');
    createBoard();
    createPieces();
}

// গেম শুরু করা
createBoard();
createPieces();
