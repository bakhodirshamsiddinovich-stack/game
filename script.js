const boardElement = document.getElementById("game-board");
const scoreElement = document.getElementById("score");
const newGameButton = document.getElementById("new-game");
const restartButton = document.getElementById("restart-game");
const gameMessage = document.getElementById("game-message");
const messageTitle = document.getElementById("message-title");

let board = [];
let score = 0;
let gameOver = false;
let won = false;

// O‘yinni boshlash
function startGame() {
    board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];

    score = 0;
    gameOver = false;
    won = false;

    gameMessage.classList.add("hidden");

    addRandomTile();
    addRandomTile();

    updateBoard();
}

// Tasodifiy katakchaga 2 yoki 4 qo‘shish
function addRandomTile() {
    const emptyCells = [];

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (board[row][col] === 0) {
                emptyCells.push({
                    row: row,
                    col: col
                });
            }
        }
    }

    if (emptyCells.length === 0) {
        return;
    }

    const randomCell =
        emptyCells[Math.floor(Math.random() * emptyCells.length)];

    board[randomCell.row][randomCell.col] =
        Math.random() < 0.9 ? 2 : 4;
}

// O‘yinni ekranga chiqarish
function updateBoard() {
    boardElement.innerHTML = "";

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            const cell = document.createElement("div");

            cell.classList.add("cell");

            const value = board[row][col];

            if (value !== 0) {
                cell.textContent = value;
                cell.setAttribute("data-value", value);
            }

            boardElement.appendChild(cell);
        }
    }

    scoreElement.textContent = score;
}

// Qatorni chapga siljitish
function slideRow(row) {
    const filtered = row.filter(value => value !== 0);

    const newRow = [];
    let points = 0;

    for (let i = 0; i < filtered.length; i++) {
        if (
            i < filtered.length - 1 &&
            filtered[i] === filtered[i + 1]
        ) {
            const mergedValue = filtered[i] * 2;

            newRow.push(mergedValue);
            points += mergedValue;

            i++;
        } else {
            newRow.push(filtered[i]);
        }
    }

    while (newRow.length < 4) {
        newRow.push(0);
    }

    return {
        row: newRow,
        points: points
    };
}

// Chapga harakat
function moveLeft() {
    let moved = false;
    let totalPoints = 0;

    for (let row = 0; row < 4; row++) {
        const oldRow = [...board[row]];
        const result = slideRow(board[row]);

        board[row] = result.row;
        totalPoints += result.points;

        if (JSON.stringify(oldRow) !== JSON.stringify(board[row])) {
            moved = true;
        }
    }

    return {
        moved: moved,
        points: totalPoints
    };
}

// O‘ngga harakat
function moveRight() {
    let moved = false;
    let totalPoints = 0;

    for (let row = 0; row < 4; row++) {
        const oldRow = [...board[row]];

        const reversed = [...board[row]].reverse();
        const result = slideRow(reversed);

        board[row] = result.row.reverse();
        totalPoints += result.points;

        if (JSON.stringify(oldRow) !== JSON.stringify(board[row])) {
            moved = true;
        }
    }

    return {
        moved: moved,
        points: totalPoints
    };
}

// Yuqoriga harakat
function moveUp() {
    let moved = false;
    let totalPoints = 0;

    for (let col = 0; col < 4; col++) {
        const oldColumn = [];

        for (let row = 0; row < 4; row++) {
            oldColumn.push(board[row][col]);
        }

        const result = slideRow(oldColumn);
        totalPoints += result.points;

        for (let row = 0; row < 4; row++) {
            board[row][col] = result.row[row];
        }

        const newColumn = [];

        for (let row = 0; row < 4; row++) {
            newColumn.push(board[row][col]);
        }

        if (
            JSON.stringify(oldColumn) !==
            JSON.stringify(newColumn)
        ) {
            moved = true;
        }
    }

    return {
        moved: moved,
        points: totalPoints
    };
}

// Pastga harakat
function moveDown() {
    let moved = false;
    let totalPoints = 0;

    for (let col = 0; col < 4; col++) {
        const oldColumn = [];

        for (let row = 0; row < 4; row++) {
            oldColumn.push(board[row][col]);
        }

        const reversed = oldColumn.reverse();
        const result = slideRow(reversed);

        result.row.reverse();
        totalPoints += result.points;

        for (let row = 0; row < 4; row++) {
            board[row][col] = result.row[row];
        }

        if (
            JSON.stringify(oldColumn) !==
            JSON.stringify(result.row)
        ) {
            moved = true;
        }
    }

    return {
        moved: moved,
        points: totalPoints
    };
}

// Harakatni bajarish
function makeMove(direction) {
    if (gameOver) {
        return;
    }

    let result;

    if (direction === "left") {
        result = moveLeft();
    } else if (direction === "right") {
        result = moveRight();
    } else if (direction === "up") {
        result = moveUp();
    } else if (direction === "down") {
        result = moveDown();
    }

    if (result.moved) {
        score += result.points;

        addRandomTile();
        updateBoard();

        checkWin();

        if (!won && !canMove()) {
            showMessage("O‘yin tugadi!");
            gameOver = true;
        }
    }
}

// G‘alabani tekshirish
function checkWin() {
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (board[row][col] === 2048) {
                won = true;
                showMessage("🎉 Siz 2048 ga erishdingiz!");
                gameOver = true;
                return;
            }
        }
    }
}

// Harakat qilish mumkinligini tekshirish
function canMove() {
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if (board[row][col] === 0) {
                return true;
            }

            if (
                col < 3 &&
                board[row][col] === board[row][col + 1]
            ) {
                return true;
            }

            if (
                row < 3 &&
                board[row][col] === board[row + 1][col]
            ) {
                return true;
            }
        }
    }

    return false;
}

// Xabar oynasini chiqarish
function showMessage(message) {
    messageTitle.textContent = message;
    gameMessage.classList.remove("hidden");
}

// Klaviatura boshqaruvi
document.addEventListener("keydown", function(event) {
    const key = event.key.toLowerCase();

    if (key === "arrowleft" || key === "a") {
        event.preventDefault();
        makeMove("left");
    }

    if (key === "arrowright" || key === "d") {
        event.preventDefault();
        makeMove("right");
    }

    if (key === "arrowup" || key === "w") {
        event.preventDefault();
        makeMove("up");
    }

    if (key === "arrowdown" || key === "s") {
        event.preventDefault();
        makeMove("down");
    }
});

// Yangi o‘yin tugmasi
newGameButton.addEventListener("click", startGame);

// Qayta boshlash tugmasi
restartButton.addEventListener("click", startGame);

// O‘yinni ishga tushirish
startGame();