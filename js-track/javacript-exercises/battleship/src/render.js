import { CELL_SIZE } from "./home.js";
import { initDrag } from "./dragndrop.js";
import { savePlayersResponse } from "./game.js";

let playerRef;
let isRandom;

export function renderInitial(player) {
    playerRef = player;

    let buttons = document.querySelector('.buttons');

    let gameDiv = document.querySelector('.game');
    gameDiv.innerHTML = '';

    gameDiv.append(
        renderShips(playerRef.gameboard.ships),
        renderBoard(playerRef.gameboard.board),
    );

    !buttons ? document.body.append(renderButtons()) : null;

    if (!isRandom) initDrag(playerRef.gameboard.board);

    isRandom = false;
}

function renderButtons() {
    const container = document.createElement('div');
    container.classList.add('buttons');

    const btnRandom = document.createElement('button');
    btnRandom.classList.add('btn', 'random');
    btnRandom.textContent = 'Randomly Place Ships';
    btnRandom.addEventListener('click', onRandomize);

    const btnReset = document.createElement('button');
    btnReset.classList.add('btn', 'reset');
    btnReset.textContent = 'Reset';
    btnReset.addEventListener('click', onReset);

    const btnSave = document.createElement('button');
    btnSave.classList.add('btn', 'save');
    btnSave.textContent = 'Save';
    btnSave.addEventListener('click', onSave);

    container.append(btnRandom, btnReset, btnSave);
    return container;
}

function renderShips(ships) {
    let shipsDiv = document.createElement('div');
    shipsDiv.classList.add('ships');

    shipsDiv.innerHTML += `
    <div class="deployment-info">
      <strong>Deployment:</strong>
        Drag ships onto the grid. Click a ship to rotate it before placement. Use
        Save to lock placements, Reset to clear the board,
        and Randomize to auto-place ships. Ships cannot overlap and must fit entirely on
        the grid.
        </div>`;

    for (let i = 0; i < ships.length; i++) {
        let currShip = ships[i];

        shipsDiv.appendChild(shipTemplate(currShip));
    }

    return shipsDiv;
}

function shipTemplate(ship, isSmall = false) {
    let shipDiv = document.createElement('div');
    let size = isSmall ? CELL_SIZE / 4 : CELL_SIZE;

    shipDiv.style.width = (size * ship.shipLength) + "px";
    shipDiv.style.height = size + "px";
    shipDiv.classList.add(isSmall ? 'ship-small' : 'ship-unset');

    shipDiv.dataset.length = ship.shipLength;
    shipDiv.dataset.orientation = 'horizontal';
    shipDiv.dataset.name = ship.name;

    if (ship.isSunk()) {
        shipDiv.classList.add('sunk');
    }

    if (isRandom) {
        shipDiv.classList.add('disabled');
    }

    return shipDiv;
}

export function renderBoard(board, isShown = true, isTarget = true, playerName) {
    let boardElement = document.createElement('div');
    boardElement.dataset.playerName = playerName;

    boardElement.classList.add('disabled');

    if (isTarget) {
        boardElement.classList.add('target');
    }

    boardElement.classList.add('board');

    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            let cell = document.createElement('div');
            cell.classList.add('cell');
            cell.id = `${x}${y}`;
            cell.dataset.x = x;
            cell.dataset.y = y;

            let value = board[x][y];

            if (value) {
                if (value === -1) {
                    cell.classList.add('miss');
                } else if (value.includes("hit")) {
                    cell.classList.add('hit');
                } else if (value.includes("ship") && isShown) {
                    cell.classList.add('ship');
                }
            }

            boardElement.appendChild(cell);
        }
    }

    return boardElement;
}

export function renderSmallShips(ships, playerTurn) {
    let smallShipsDiv = document.createElement('div');
    smallShipsDiv.classList.add('small-ships');

    for (let i = 0; i < ships.length; i++) {
        let currShip = ships[i];

        smallShipsDiv.appendChild(shipTemplate(currShip, true));
    }

    if (playerTurn) {
        smallShipsDiv.innerHTML += `<div class="turn">Your Turn</div>`;
    }

    return smallShipsDiv;
}

function onRandomize() {
    onReset();
    playerRef.gameboard.randomlyPlaceShips();
    isRandom = true;
    renderInitial(playerRef);
}

function onSave(e) {
    if (!playerRef.gameboard.areAllShipsPlaced()) {
        alert("Place all ships before saving!");
        return;
    }

    savePlayersResponse(playerRef);
}

function onReset(e) {
    playerRef.gameboard.reset();
    renderInitial(playerRef);
}
