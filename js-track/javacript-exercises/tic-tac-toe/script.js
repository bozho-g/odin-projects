function Gameboard() {
    const rows = 3;
    const columns = 3;
    const board = [];

    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < columns; j++) {
            board[i].push(Cell());
        }
    }

    const getBoard = () => board;

    const markCell = (row, col, player) => {
        if (!isValidIndex(row, col) || board[row][col].getValue() !== '') {
            return false;
        }

        board[row][col].addToken(player);
        return true;
    };

    const isValidIndex = (row, column) => {
        return row >= 0 && row < rows && column >= 0 && column < columns;
    };

    return { getBoard, markCell, isValidIndex };
}

function Cell() {
    let value = '';

    const setCellValue = (player) => {
        value = player;
    };

    const getValue = () => value;

    return {
        addToken: setCellValue,
        getValue,
    };
}

function GameController(playerOneName = "X", playerTwoName = "O") {
    let board = Gameboard();

    const players = [
        {
            name: playerOneName,
            token: 'X'
        },
        {
            name: playerTwoName,
            token: 'O'
        }
    ];

    let activePlayer = players[0];
    let winner = null;
    let moves = 0;
    let winningLine = null;
    let isDraw = false;

    const scoreboard = {
        xWins: 0,
        oWins: 0,
        draws: 0,
    };

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };

    const getIsDraw = () => isDraw;
    const getActivePlayer = () => activePlayer;
    const getWinner = () => winner;
    const getWinningLine = () => winningLine;
    const getScoreboard = () => scoreboard;

    function checkWin(row, col, playerToken) {
        const boardArr = board.getBoard();

        let winningRow = true;
        let winningCol = true;
        let winningDiag = (row === col);
        let winningAntiDiag = (row + col === 2);

        for (let i = 0; i < 3; i++) {
            if (boardArr[row][i].getValue() !== playerToken) {
                winningRow = false;
            }

            if (boardArr[i][col].getValue() !== playerToken) {
                winningCol = false;
            }

            if (winningDiag && boardArr[i][i].getValue() !== playerToken) {
                winningDiag = false;
            }

            if (winningAntiDiag && boardArr[i][2 - i].getValue() !== playerToken) {
                winningAntiDiag = false;
            }
        }

        if (winningRow) {
            winningLine = [[row, 0], [row, 1], [row, 2]];
        } else if (winningCol) {
            winningLine = [[0, col], [1, col], [2, col]];
        } else if (winningDiag) {
            winningLine = [[0, 0], [1, 1], [2, 2]];
        } else if (winningAntiDiag) {
            winningLine = [[0, 2], [1, 1], [2, 0]];
        } else return false;

        return true;
    }

    const playRound = (row, col) => {
        if (winner || isDraw) {
            return;
        }

        row = +row;
        col = +col;

        const playerToken = getActivePlayer().token;
        if (!board.markCell(row, col, playerToken)) {
            return;
        }

        moves++;

        if (checkWin(row, col, playerToken)) {
            winner = getActivePlayer();
            playerToken === 'X' ? scoreboard.xWins++ : scoreboard.oWins++;
            return;
        }

        if (moves === 9) {
            isDraw = true;
            scoreboard.draws++;
            return;
        }

        switchPlayerTurn();
    };

    const resetGame = () => {
        activePlayer = players[0];
        winner = null;
        moves = 0;
        winningLine = null;
        isDraw = false;
        const grid = board.getBoard();

        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                grid[r][c].addToken('');
            }
        }
    };

    return {
        playRound,
        getActivePlayer,
        getWinner,
        getWinningLine,
        getIsDraw,
        resetGame,
        getBoard: board.getBoard,
        getScoreboard
    };
}

function ScreenController() {
    const game = GameController();
    const playerTurnElmnt = document.querySelector('.turn');
    const boardDiv = document.querySelector('.board');
    const resetBtn = document.querySelector('.reset');
    const scoreboardDiv = document.querySelector('.scoreboard .scores');

    const updateScreen = () => {
        boardDiv.textContent = "";

        const board = game.getBoard();
        const activePlayer = game.getActivePlayer();
        const winner = game.getWinner();
        const isDraw = game.getIsDraw();
        const winningLine = game.getWinningLine();
        const scoreboard = game.getScoreboard();

        if (winner) {
            playerTurnElmnt.textContent = `${winner.token} wins!`;
        } else if (isDraw) {
            playerTurnElmnt.textContent = 'Draw!';
        } else {
            playerTurnElmnt.textContent = `${activePlayer.name}'s turn`;
        }

        board.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellButton = document.createElement("button");
                cellButton.classList.add("box");
                cellButton.dataset.row = rowIndex;
                cellButton.dataset.column = colIndex;

                let value = cell.getValue();

                cellButton.textContent = value;
                if (value === 'X') {
                    cellButton.classList.add('x');
                } else if (value === 'O') {
                    cellButton.classList.add('o');
                }

                if (winner || isDraw) {
                    cellButton.disabled = true;
                    if (winningLine && winningLine.some(([wr, wc]) => wr === rowIndex && wc === colIndex)) {
                        cellButton.classList.add('win');
                    }
                }

                boardDiv.appendChild(cellButton);
            });
        });

        scoreboardDiv.querySelector('.x-score').textContent = `X: ${scoreboard.xWins}`;
        scoreboardDiv.querySelector('.o-score').textContent = `O: ${scoreboard.oWins}`;
        scoreboardDiv.querySelector('.draw-score').textContent = `Draws: ${scoreboard.draws}`;
    };

    function clickHandlerBoard(e) {
        if (!e.target.classList.contains('box')) {
            return;
        }

        if (game.getWinner() || game.getIsDraw()) {
            return;
        }

        const row = +e.target.dataset.row;
        const col = +e.target.dataset.column;

        game.playRound(row, col);
        updateScreen();
    }

    function reset() {
        game.resetGame();
        updateScreen();
    }

    boardDiv.addEventListener("click", clickHandlerBoard);
    resetBtn.addEventListener('click', reset);

    updateScreen();
}

ScreenController();