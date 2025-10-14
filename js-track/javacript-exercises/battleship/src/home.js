import { startGame } from "./game.js";

export const CELL_SIZE = 40;

export const home = {
    initalize() {
        document.body.style.setProperty("--cell-size", `${CELL_SIZE}px`);
        document.querySelectorAll('.btn.choice').forEach(x => x.addEventListener('click', (e) => {
            document.querySelector('.home').style.display = 'none';
            document.querySelector('.game').style.display = 'flex';
            startGame(e);
        }));
    }
};