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

topScoreElem.textContent = topScore;

const BLOCK_COLORS = ['#f44336', '#2196f3', '#ffeb3b', '#4caf50', '#9c27b0', '#ff9800'];
const SHAPES = [
    [[1, 1], [1, 1]], // ২x২
    [[1, 1, 1]],      // ৩ সাইজ সোজা
    [[1], [1], [1]],  // ৩ সাইজ লম্বালম্বি
    [[1, 0], [1, 1]], // L-শেপ
    [[1]]             // ১ সাইজ ডট
];

let isSoundOn = true;
let isVibrationOn = true;
let audioCtx = null;
let bgmInterval = null;

// সেটিংস মোডাল কন্ট্রোল
const settingsModal = document.getElementById('settings-modal');
document.getElementById('open-settings').onclick = () => settingsModal.classList.add('active');
document.getElementById('close-settings').onclick = () => settingsModal.classList.remove('active');

document.getElementById('sound-toggle').onchange = (e) => {
    isSoundOn = e.target.checked;
    if (isSoundOn) startBGM(); else stopBGM();
};
document.getElementById('vibration-toggle').onchange = (e) => isVibrationOn = e.target.checked;
document.getElementById('theme-select').onchange = (e) => {
    document.body.className = '';
    if (e.target.value !== 'classic') document.body.classList.add(`${e.target.value}-theme`);
};

// অডিও এবং ভাইব্রেশন
function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
}

function startBGM() {
    if (bgmInterval || !isSoundOn) return;
    const notes = [261.63, 293.66, 329.63, 349.23, 392.00];
    let step = 0;
    bgmInterval = setInterval(() => {
        if (!isSoundOn || !audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(notes[step % notes.length], audioCtx.currentTime);
        gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
        step++;
    }, 500);
}

function stopBGM() {
    if (bgmInterval) { clearInterval(bgmInterval); bgmInterval = null; }
}

function playCrashSound() {
    if (!isSoundOn || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
}

function triggerVibration() {
    if (isVibrationOn && navigator.vibrate) navigator.vibrate(100);
}

function updateScore(points) {
    currentScore += points;
    currentScoreElem.textContent = currentScore;
    if (currentScore > topScore) {
        topScore = currentScore;
        topScoreElem.textContent = topScore;
        localStorage.setItem('block_master_top_score', topScore);
    }
}

// বোর্ড তৈরি
function createBoard() {
    board.innerHTML = '';
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
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

function createPieces() {
    piecesContainer.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        const piece = document.createElement('div');
        piece.classList.add('piece');
        piece.setAttribute('draggable', 'true');
        piece.style.gridTemplateColumns = `repeat(${shape[0].length}, 25px)`;

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
            initAudio();
            startBGM();
            draggedPieceShape = shape;
            draggedPieceColor = randomColor;
            draggedPieceElement = piece;
            e.dataTransfer.setData('text/plain', '');
        });

        // মোবাইল ও ডেসকটপ ক্লিক প্লেসমেন্ট সাপোর্ট
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
        draggedPieceElement.remove();
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
        playCrashSound();
        triggerVibration();
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
        cell.classList.add('clear-anim');
        setTimeout(() => {
            cell.classList.remove('filled', 'clear-anim');
            cell.style.backgroundColor = '';
        }, 300);
    }
}

function checkGameOver() {
    const remainingPieces = Array.from(piecesContainer.children);
    if (remainingPieces.length === 0) return;

    let canMove = false;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            for (let shape of SHAPES) {
                if (canPlace(shape, r, c)) {
                    canMove = true;
                    break;
                }
            }
        }
    }

    if (!canMove) {
        setTimeout(() => {
            finalScoreElem.textContent = currentScore;
            gameOverModal.classList.add('active');
        }, 500);
    }
}

// অ্যাড দেখে রিভাইভ বা কন্টিনিউ
document.getElementById('watch-ad-btn').onclick = () => {
    alert(navigator.onLine ? "বিজ্ঞাপন লোড হচ্ছে..." : "অফলাইন মোড: আপনাকে ফ্রি রিভাইভ দেওয়া হলো!");
    setTimeout(() => {
        gameOverModal.classList.remove('active');
        // গেমের সুবিধা দেওয়ার জন্য ৩টি সারি খালি করা
        for (let r = 3; r <= 5; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) clearCell(r, c);
        }
        createPieces();
    }, 1000);
};

// রিস্টার্ট গেম
document.getElementById('restart-btn').onclick = restartGame;

function restartGame() {
    grid = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
    currentScore = 0;
    currentScoreElem.textContent = '0';
    gameOverModal.classList.remove('active');
    createBoard();
    createPieces();
}

document.body.addEventListener('click', () => { initAudio(); startBGM(); }, { once: true });

// অফলাইন সাপোর্ট সার্ভিস ওয়ার্কার (PWA Registration)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const swCode = `
            self.addEventListener('install', e => e.waitUntil(caches.open('block-game').then(c => c.addAll(['/']))));
            self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
        `;
        const blob = new Blob([swCode], { type: 'application/javascript' });
        navigator.serviceWorker.register(URL.createObjectURL(blob)).catch(() => {});
    });
}

restartGame();
