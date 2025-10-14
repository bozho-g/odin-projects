import { Gameboard } from "./gameboard.js";

export class Player {
    constructor() {
        this.gameboard = new Gameboard();
    }

    attack(defender, row, col) {
        defender.gameboard.receiveAttack(row, col);
    }

    placeShip(shipName, row, col, direction) {
        this.gameboard.placeShip(shipName, row, col, direction);
    }
}

export class Bot extends Player {
    constructor() {
        super();
        this.attackObj = {
            hasHit: false,
        };
    }

    attack(defender) {
        let attackRes;

        let row = this.randomValue(7, 0);
        let col = this.randomValue(7, 0);
        if (!this.attackObj.hasHit) {
            attackRes = defender.gameboard.receiveAttack(row, col);

            while (attackRes === false) {
                row = this.randomValue(7, 0);
                col = this.randomValue(7, 0);
                attackRes = defender.gameboard.receiveAttack(row, col);
            }
        } else {
            let options = [
                [this.attackObj.saveRow + 1, this.attackObj.saveCol],
                [this.attackObj.saveRow, this.attackObj.saveCol + 1],
                [this.attackObj.saveRow - 1, this.attackObj.saveCol],
                [this.attackObj.saveRow, this.attackObj.saveCol - 1],

                [this.attackObj.saveRow + 1, this.attackObj.saveCol + 1],
                [this.attackObj.saveRow - 1, this.attackObj.saveCol + 1],
                [this.attackObj.saveRow + 1, this.attackObj.saveCol - 1],
                [this.attackObj.saveRow - 1, this.attackObj.saveCol - 1],
                [this.randomValue(7, 0), this.randomValue(7, 0)]
            ];

            for (let i = 0; i < options.length; i++) {
                row = options[i][0];
                col = options[i][1];
                attackRes = defender.gameboard.receiveAttack(row, col);
                if (attackRes !== false) {
                    break;
                }
            }
        }

        if (attackRes === 'hit') {
            this.attackObj.hasHit = true;
            this.attackObj.saveRow = row;
            this.attackObj.saveCol = col;
            this.attack(defender);
        } else {
            this.attackObj.hasHit = false;
        }
    }

    randomValue(max, min) {
        return Math.floor(Math.random() * (max - min) + min);
    }
}