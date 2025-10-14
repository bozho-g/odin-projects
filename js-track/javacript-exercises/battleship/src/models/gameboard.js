import { Ship } from "./ship.js";

export class Gameboard {
    constructor() {
        this.board = Array.from({ length: 8 }, () => Array(8).fill(null));
        this.initalizeShips();
    }

    initalizeShips() {
        this.ships = [];
        let lengths = [2, 3, 3, 4, 5];
        let names = ["ship2", "ship31", "ship32", "ship4", "ship5"];

        lengths.forEach((len, i) => {
            this.ships.push(
                new Ship(len, names[i])
            );
        });
    }

    placeShip(shipName, row, col, direction) {
        let ship = this.ships.find(x => x.name === shipName);

        if (!ship) {
            return false;
        }

        if (!this.isSafe(row, col)) {
            return false;
        }

        let areAllSafe = true;

        if (direction === "horizontal") {
            for (let i = col; i < col + ship.shipLength; i++) {
                if (!this.isSafe(row, i)) {
                    areAllSafe = false;
                }
            }

            if (!areAllSafe) {
                return false;
            }

            for (let i = col; i < col + ship.shipLength; i++) {
                this.board[row][i] = ship.name;
            }

            return true;
        }

        for (let i = row; i < row + ship.shipLength; i++) {
            if (!this.isSafe(i, col)) {
                areAllSafe = false;
            }
        }

        if (areAllSafe) {
            for (let i = row; i < row + ship.shipLength; i++) {
                this.board[i][col] = shipName;
            }

            return true;
        }
    }

    randomlyPlaceShips() {
        const returnRandomPlacement = () => {
            return [Math.random() <= 0.5 ? "horizontal" : "vertical", Math.floor(Math.random() * 7), Math.floor(Math.random() * 7)];
        };

        this.ships.forEach(ship => {
            let [direction, row, col] = returnRandomPlacement();
            while (!this.placeShip(ship.name, row, col, direction)) {
                [direction, row, col] = returnRandomPlacement();
            }
        });
    }

    areAllShipsPlaced() {
        let flattenedBoard = this.board.flat();
        return this.ships.every(ship => flattenedBoard.includes(ship.name));
    }

    isSafe(row, col) {
        return this.isInBoard(row, col) && this.board[row][col] === null;
    }

    isInBoard(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    receiveAttack(row, col) {
        if (!this.isInBoard(row, col)) {
            return false;
        }

        let value = this.board[row][col];

        if (value === null) {
            this.board[row][col] = -1;
            return true;
        }

        if (value === -1) {
            return false;
        }

        if (value.includes("hit")) {
            return false;
        }

        if (value.includes("ship")) {
            this.board[row][col] = `${value}hit`;

            this.ships.find(x => x.name === value).hit();
            return "hit";
        }
    }

    areAllSunk() {
        return this.ships.every(x => x.isSunk());
    }

    reset() {
        this.board = Array.from({ length: 8 }, () => Array(8).fill(null));
        this.initalizeShips();
    }
}