import { Player, Bot } from "./models/player.js";
import { renderBoard, renderInitial, renderSmallShips as renderSmallShipsAndTurn } from "./render.js";

let player1;
let player2;

let currentPlayerRef;
let otherPlayerRef;

let isBot = false;

let gameDiv = document.querySelector('.game');

export function startGame(e) {
    let choice = e.target.closest('.btn.choice').classList.contains("bot") ? "bot" : "player";

    player1 = new Player();
    renderInitial(player1);

    if (choice === "bot") {
        isBot = true;
        player2 = new Bot();
    } else {
        player2 = new Player();
        gameDisplayController.toggleHideScreen(false);
    }
}

export function savePlayersResponse(playerRef) {
    if (playerRef === player1) {
        if (!isBot) {
            gameDisplayController.toggleHideScreen(false);
            gameDisplayController.changeContent("pass");
            renderInitial(player2);
            return;
        }

        player2.gameboard.randomlyPlaceShips();
    }

    gameDisplayController.clearAfterSave();
    currentPlayerRef = player1;
    otherPlayerRef = player2;
    playRound();
}

function playRound() {
    updateBoards();

    setUpBoardListeners();

    if (isBot && currentPlayerRef === player2) {
        botAttack();
    }
}

function setUpBoardListeners() {
    const targetBoard = document.querySelector('.board.target');

    targetBoard.removeEventListener('click', handleAttack);
    targetBoard.addEventListener('click', handleAttack);
}

function botAttack() {
    player2.attack(otherPlayerRef);

    endTurn();
}

function handleAttack(e) {
    let cell = e.target.closest('.cell');

    if (!isValidAttack(cell)) {
        return;
    }

    let result = otherPlayerRef.gameboard.receiveAttack(+cell.dataset.x, +cell.dataset.y);

    if (result === "hit") {
        if (isWinner()) {
            return;
        }
        playRound();
        return;
    }

    endTurn();
}

function isValidAttack(cell) {
    if (!cell) return false;
    return !(cell.classList.contains("miss") || cell.classList.contains("hit"));
}

function endTurn() {
    if (isWinner()) {
        return;
    }

    [currentPlayerRef, otherPlayerRef] = [otherPlayerRef, currentPlayerRef];
    playRound();
}

function updateBoards() {
    gameDisplayController.clearGameScreen();

    gameDiv.append(
        renderSmallShipsAndTurn(player1.gameboard.ships, currentPlayerRef === player1),
        renderBoard(player1.gameboard.board, isBot, currentPlayerRef !== player1, "player1"),
        renderBoard(player2.gameboard.board, false, currentPlayerRef !== player2, "player2"),
        renderSmallShipsAndTurn(player2.gameboard.ships, currentPlayerRef === player2)
    );
}

function isWinner() {
    let winner;

    if (!currentPlayerRef.gameboard.areAllSunk() && !otherPlayerRef.gameboard.areAllSunk()) {
        return false;
    }

    updateBoards();

    if (currentPlayerRef.gameboard.areAllSunk()) {
        winner = otherPlayerRef;
    }

    if (otherPlayerRef.gameboard.areAllSunk()) {
        winner = currentPlayerRef;
    }

    let isBotWinner = winner instanceof Bot;
    let playerName = winner === player1 ? "player1" : "player2";

    document.querySelector('.turn')?.remove();
    document.querySelectorAll('.board.target').forEach(b => b.removeEventListener('click', handleAttack));

    let winnerDiv = document.createElement('div');
    winnerDiv.classList.add('winner');

    winnerDiv.textContent = isBotWinner ? "Bot Wins!" : "You Win!";

    if (playerName === 'player1') {
        winnerDiv.style.left = '22%';
    } else {
        winnerDiv.style.left = '60%';
    }

    gameDiv.appendChild(winnerDiv);
    gameDisplayController.showPlayAgainItems();
    return true;
}

const gameDisplayController = {
    hideDiv: null,
    textDiv: null,
    init() {
        this.hideDiv = document.querySelector('.hide-screen');
        this.textDiv = this.hideDiv.querySelector('.hide-title');

        document.querySelector('.continue-btn').addEventListener('click', () => {
            this.toggleHideScreen();
        });
    },
    toggleHideScreen(toggle) {
        this.hideDiv.classList.toggle('hidden', toggle);

    },
    changeContent(content) {
        this.textDiv.textContent = content === "hide"
            ? "Hide the screen from your friend and place your ships"
            : "Pass the screen to your friend and don't look :)";
    },
    clearGameScreen() {
        gameDiv.innerHTML = '';
    },
    clearAfterSave() {
        this.clearGameScreen();
        document.querySelector('.buttons').classList.add('hidden');
    },
    showPlayAgainItems() {
        document.querySelector('.play-again').style.display = "block";
        document.querySelector('.play-again-btn').addEventListener('click', () => {
            window.location.reload();
        });
    }
};

gameDisplayController.init();