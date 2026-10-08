const BOARD_SIZE = 8;
const boardElement = document.getElementById("board");
const pickerElement = document.getElementById("block-picker");
const scoreElement = document.getElementById("score");

let grid = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
let score = 0;
let currentPieces = [];

// সম্ভাব্য বিভিন্ন ব্লকের শেপ (Shapes)
const SHAPES = [
    [[1, 1], [1, 1]], // ২x২ স্কয়ার
    [[1, 1, 1]],      // ৩ লাইনের সোজা ব্লক
    [[1], [1], [1]],  // ৩ লাইনের লম্বালম্বি ব্লক
    [[1, 0], [1, 1]], // L-শেপ
    [[1]]             // সিঙ্গেল ডট
];

function initGame() {
    createBoard();
    generateNewPieces();
}

// বোর্ড গ্রিড তৈরি
function createBoard() {
    boardElement.innerHTML = "";
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = r;
            cell.dataset.col = c;
            boardElement.appendChild(cell);
        }
    }
}

// ৩টি নতুন শেপ তৈরি করা
function generateNewPieces() {
    pickerElement.innerHTML = "";
    currentPieces = [];

    for (let i = 0; i < 3; i++) {
        const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        currentPieces.push(randomShape);
        renderPiece(randomShape, i);
    }
}

function renderPiece(shape, index) {
    const pieceEl = document.createElement("div");
    pieceEl.classList.add("piece");
    pieceEl.style.gridTemplateColumns = `repeat(${shape[0].length}, 25px)`;

    shape.forEach((row) => {
        row.forEach((val) => {
            const cell = document.createElement("div");
            cell.classList.add("piece-cell");
            if (!val) cell.classList.add("empty");
            pieceEl.appendChild(cell);
        });
    });

    // ক্লিক করে বোর্ডে ব্লক বসানো (ক্লিক প্লেসমেন্ট লজিক)
    pieceEl.addEventListener("click", () => placePieceOnBoard(shape, index, pieceEl));
    pickerElement.appendChild(pieceEl);
}

function placePieceOnBoard(shape, index, pieceEl) {
    // খালি জায়গা খুঁজে বের করে প্লেস করা
    for (let r = 0; r <= BOARD_SIZE - shape.length; r++) {
        for (let c = 0; c <= BOARD_SIZE - shape[0].length; c++) {
            if (canPlace(shape, r, c)) {
                drawShape(shape, r, c);
                pieceEl.remove();
                addScore(countBlocks(shape));
                checkLines();
                
                // ৩টি ব্লকই ব্যবহার করা হলে নতুন ৩টি আবার আসবে
                if (pickerElement.children.length === 0) {
                    generateNewPieces();
                }
                return;
            }
        }
    }
    alert("এই ব্লকটি বসানোর মতো পর্যাপ্ত জায়গা খালি নেই!");
}

function canPlace(shape, startR, startC) {
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[0].length; c++) {
            if (shape[r][c] && grid[startR + r][startC + c] === 1) {
                return false;
            }
        }
    }
    return true;
}

function drawShape(shape, startR, startC) {
    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[0].length; c++) {
            if (shape[r][c]) {
                grid[startR + r][startC + c] = 1;
                const cellIndex = (startR + r) * BOARD_SIZE + (startC + c);
                boardElement.children[cellIndex].classList.add("filled");
            }
        }
    }
}

function countBlocks(shape) {
    return shape.flat().filter(v => v === 1).length;
}

function addScore(pts) {
    score += pts * 10;
    scoreElement.innerText = score;
}

// পুরো রো বা কলাম পূর্ণ হলে ভ্যানিশ করা (Line Clear)
function checkLines() {
    let rowsToClear = [];
    let colsToClear = [];

    // রো চেক
    for (let r = 0; r < BOARD_SIZE; r++) {
        if (grid[r].every(val => val === 1)) rowsToClear.push(r);
    }

    // কলাম চেক
    for (let c = 0; c < BOARD_SIZE; c++) {
        let full = true;
        for (let r = 0; r < BOARD_SIZE; r++) {
            if (grid[r][c] === 0) { full = false; break; }
        }
        if (full) colsToClear.push(c);
    }

    // রো ও কলাম মুছে ফেলা এবং অ্যানিমেশন দেওয়া
    rowsToClear.forEach(r => {
        for (let c = 0; c < BOARD_SIZE; c++) clearCell(r, c);
    });

    colsToClear.forEach(c => {
        for (let r = 0; r < BOARD_SIZE; r++) clearCell(r, c);
    });
}

function clearCell(r, c) {
    grid[r][c] = 0;
    const cell = boardElement.children[r * BOARD_SIZE + c];
    cell.classList.add("clear-anim");
    setTimeout(() => {
        cell.classList.remove("filled", "clear-anim");
    }, 300);
}

// বিজ্ঞাপন দেখে গেম কন্টিনিউ করার অপশন
function watchAdToContinue() {
    alert("বিজ্ঞাপন দেখা হচ্ছে...");
    setTimeout(() => {
        document.getElementById("game-over-modal").classList.add("hidden");
        // কিছু ব্লক খালি করে গেম চালুর সুযোগ দেওয়া
        grid[3].fill(0);
        grid[4].fill(0);
        createBoard();
        // আগের গ্রিড ডাটা অনুযায়ী রিড্র করা
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (grid[r][c] === 1) {
                    boardElement.children[r * BOARD_SIZE + c].classList.add("filled");
                }
            }
        }
        generateNewPieces();
    }, 1000);
}

function restartGame() {
    grid = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
    score = 0;
    scoreElement.innerText = score;
    document.getElementById("game-over-modal").classList.add("hidden");
    initGame();
}

initGame();
