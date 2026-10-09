// নিখুঁত গেম ওভার চেক লজিক (নিচে নিচে থাকা প্রতিটি পিস টেস্ট করবে)
function checkGameOver() {
    const remainingPieces = Array.from(piecesContainer.children);
    if (remainingPieces.length === 0) return;

    let canMove = false;

    // পিস কন্টেইনারে যে কয়টি শেপ বাকি আছে তার সবগুলো চেক করা
    for (let pieceEl of remainingPieces) {
        const shape = pieceEl.shapeData; // বর্তমানে কন্টেইনারে থাকা শেপ
        if (!shape) continue;

        // বোর্ডের প্রতিটা ঘরে বসিয়ে টেস্ট করা
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

    // যদি একটি শেপও বসানোর মতো জায়গা না থাকে
    if (!canMove) {
        setTimeout(() => {
            playGameOverSound(); // গেম ওভার সাউন্ড বাজাবে
            finalScoreElem.textContent = currentScore;
            gameOverModal.classList.add('active'); // গেম ওভার পপআপ আসবে
        }, 600);
    }
}

// গেম ওভারের বিশেষ সাউন্ড ইফেক্ট
function playGameOverSound() {
    if (!isSoundOn || !audioCtx) return;
    stopBGM(); // ব্যাকগ্রাউন্ড মিউজিক বন্ধ করবে

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, audioCtx.currentTime + 0.6);

    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);
}

// createPieces ফাংশনটি এভাবে আপডেট করে নিন যেন শেপ ডাটা সেভ থাকে
function createPieces() {
    piecesContainer.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        const piece = document.createElement('div');
        piece.classList.add('piece');
        piece.setAttribute('draggable', 'true');
        piece.style.gridTemplateColumns = `repeat(${shape[0].length}, 25px)`;

        // শেপ ডাটা এলিমেন্টে রেখে দেওয়া
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
            initAudio();
            startBGM();
            draggedPieceShape = shape;
            draggedPieceColor = randomColor;
            draggedPieceElement = piece;
            e.dataTransfer.setData('text/plain', '');
        });

        piece.addEventListener('click', () => handlePieceClick(shape, randomColor, piece));

        piecesContainer.appendChild(piece);
    }

    // নতুন ব্লক তৈরি করার সাথে সাথে চেক হবে বসানো সম্ভব কি না
    checkGameOver();
}
