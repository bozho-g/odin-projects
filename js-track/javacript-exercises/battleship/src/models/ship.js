export class Ship {
    constructor(length, name) {
        this.shipLength = length;
        this.name = name;
        this.hits = 0;
        this.coordinates = [];
    }

    hit() {
        this.hits++;
    }

    isSunk() {
        return this.hits === this.shipLength;
    }
}