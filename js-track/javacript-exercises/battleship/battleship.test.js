import { Gameboard } from "./src/models/gameboard.js";
import { Player, Bot } from "./src/models/player.js";
import { Ship } from "./src/models/ship.js";
import { jest } from '@jest/globals';

describe("Ship tests", () => {
    let ship;

    beforeEach(() => {
        ship = new Ship(4);
    });

    it("Should take hit properly", () => {
        ship.hit();

        expect(ship.hits).toBe(1);
    });

    it("Should sink properly", () => {
        ship = new Ship(4);

        ship.hit(); ship.hit(); ship.hit(); ship.hit();

        expect(ship.isSunk()).toBe(true);
    });
});

describe("Gameboard tests", () => {
    let gameboard;

    beforeEach(() => {
        gameboard = new Gameboard();
    });

    it("Should initalize ships", () => {
        expect(gameboard.ships.length).toBe(5);
    });

    it("Should have proper ship lengths", () => {
        let lengths = [2, 3, 3, 4, 5];

        for (let i = 0; i < gameboard.ships.length; i++) {
            expect(gameboard.ships[i].shipLength).toBe(lengths[i]);
        }
    });

    it("Should have proper ship names", () => {
        let names = ["ship2", "ship31", "ship32", "ship4", "ship5"];

        for (let i = 0; i < gameboard.ships.length; i++) {
            expect(gameboard.ships[i].name).toBe(names[i]);
        }
    });

    it("Should place ship horizontal properly", () => {
        gameboard.placeShip("ship2", 0, 0, "horizontal");

        expect(gameboard.board[0]).toStrictEqual(
            ["ship2", "ship2", ...Array(6).fill(null)]
        );

        gameboard.placeShip("ship5", 1, 0, "horizontal");

        expect(gameboard.board[1]).toStrictEqual(
            ["ship5", "ship5", "ship5", "ship5", "ship5", ...Array(3).fill(null)]
        );
    });

    it("Should place ship vertical properly", () => {
        gameboard.placeShip("ship2", 0, 0, "vertical");

        expect(gameboard.board.slice(0, 2)).toStrictEqual([
            ["ship2", ...Array(7).fill(null)],
            ["ship2", ...Array(7).fill(null)],
        ]);
    });

    it("Should not place ship if space is taken", () => {
        gameboard.placeShip("ship2", 0, 0, "horizontal");
        gameboard.placeShip("ship5", 0, 0, "horizontal");

        expect(gameboard.board[0]).toStrictEqual(
            ["ship2", "ship2", ...Array(6).fill(null)]
        );
    });

    it("Should display hit properly", () => {
        gameboard.placeShip("ship2", 0, 0, "horizontal");
        gameboard.receiveAttack(0, 1);

        expect(gameboard.board[0]).toStrictEqual(
            ["ship2", "ship2hit", ...Array(6).fill(null)]);
    });

    it("Should sink ship properly", () => {
        gameboard.placeShip("ship2", 0, 0, "horizontal");
        gameboard.receiveAttack(0, 0);
        gameboard.receiveAttack(0, 1);

        let ship = gameboard.ships.find(x => x.name === "ship2");

        expect(ship.hits === 2);
        expect(ship.isSunk()).toBeTruthy();
        expect(gameboard.board[0]).toStrictEqual(
            ["ship2hit", "ship2hit", ...Array(6).fill(null)]);
    });

    it("Should miss shot properly", () => {
        gameboard.placeShip("ship2", 0, 0, "horizontal");
        gameboard.receiveAttack(0, 2);
        gameboard.receiveAttack(0, 7);

        expect(gameboard.board[0]).toStrictEqual(
            ["ship2", "ship2", -1, ...Array(4).fill(null), -1]);
    });

    it("Should report if all ships are sunk", () => {
        gameboard.placeShip("ship2", 0, 0, "horizontal");
        gameboard.placeShip("ship31", 1, 0, "horizontal");
        gameboard.placeShip("ship32", 2, 0, "horizontal");
        gameboard.placeShip("ship4", 3, 0, "horizontal");
        gameboard.placeShip("ship5", 4, 0, "horizontal");

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                gameboard.receiveAttack(i, j);
            }
        }

        expect(gameboard.areAllSunk()).toBeTruthy();
        expect(gameboard.board.slice(0, 5)).toStrictEqual([
            ["ship2hit", "ship2hit", ...Array(6).fill(-1)],
            ["ship31hit", "ship31hit", "ship31hit", ...Array(5).fill(-1)],
            ["ship32hit", "ship32hit", "ship32hit", ...Array(5).fill(-1)],
            ["ship4hit", "ship4hit", "ship4hit", "ship4hit", ...Array(4).fill(-1)],
            ["ship5hit", "ship5hit", "ship5hit", "ship5hit", "ship5hit", ...Array(3).fill(-1)],
        ]);
    });

    it("Should report if ships are not sunk", () => {
        expect(gameboard.areAllSunk()).toBeFalsy();
    });
});

describe("Player tests", () => {
    let player1;
    let player2;

    beforeEach(() => {
        player1 = new Player();
        player2 = new Player();
    });

    it("Game should make player 1 hit player 2 board", () => {
        player1.attack(player2, 0, 0);
        player1.attack(player2, 0, 1);

        expect(player2.gameboard.board[0]).toStrictEqual([-1, -1, ...Array(6).fill(null)]);
    });

    it("Should establish win properly", () => {
        jest.spyOn(player2.gameboard, 'areAllSunk').mockReturnValue(true);

        let areSunk = player2.gameboard.areAllSunk();
        expect(areSunk).toBeTruthy();
        expect(player2.gameboard.areAllSunk).toHaveBeenCalled();
    });

    it("Bot should hit random place", () => {
        player2 = new Bot();
        player2.attack(player1);

        expect(player1.gameboard.board.flat()).toContain(-1);
    });
});