* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    background-color: #1a1a2e;
    color: #fff;
    font-family: Arial, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

.game-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
}

.header {
    text-align: center;
}

.score-board {
    font-size: 24px;
    margin-top: 10px;
    color: #e94560;
}

/* গেম গ্রিড বোর্ড */
.board {
    display: grid;
    grid-template-columns: repeat(8, 40px);
    grid-template-rows: repeat(8, 40px);
    gap: 4px;
    background-color: #16213e;
    padding: 8px;
    border-radius: 8px;
}

.cell {
    width: 40px;
    height: 40px;
    background-color: #0f3460;
    border-radius: 4px;
    transition: background-color 0.2s, transform 0.2s, opacity 0.3s;
}

.cell.filled {
    background-color: #e94560;
}

/* লাইন ভ্যানিশ হওয়ার অ্যানিমেশন */
.cell.clear-anim {
    transform: scale(0);
    opacity: 0;
}

/* জেনারেট হওয়া ব্লক চয়ন করার জায়গা */
.block-picker {
    display: flex;
    gap: 20px;
    min-height: 120px;
    align-items: center;
}

.piece {
    display: grid;
    gap: 2px;
    cursor: grab;
    padding: 5px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
}

.piece-cell {
    width: 25px;
    height: 25px;
    background-color: #e94560;
    border-radius: 3px;
}

.piece-cell.empty {
    background-color: transparent;
}

/* পপআপ মোডাল */
.modal {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal.hidden {
    display: none;
}

.modal-content {
    background: #16213e;
    padding: 30px;
    border-radius: 12px;
    text-align: center;
}

.modal-content button {
    margin-top: 15px;
    padding: 10px 20px;
    font-size: 16px;
    background: #e94560;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}
