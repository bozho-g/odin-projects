import { initPanzoom } from './pan.js';
import { showModal, showFinishModal } from './modals.js';

const cfg = window.GAME_CONFIG;
const clientStartTime = cfg.initialStartTime;
const pictureId = cfg.initialPictureId;

export const gameImg = document.querySelector("#game-image");
export const clickMenu = document.querySelector(".click-menu");

function updateTimer() {
    const now = Date.now();
    const elapsed = now - clientStartTime;
    const totalSeconds = Math.floor(elapsed / 1000);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    document.getElementById('time').textContent = minutes + ':' + seconds;
}
setInterval(updateTimer, 100);

initPanzoom();

let clicked = false;
let lastClickX = null;
let lastClickY = null;

gameImg.addEventListener('mousedown', e => { clicked = true; });
gameImg.addEventListener('mousemove', e => { clicked = false; });
gameImg.addEventListener('mouseup', e => {
    if (clicked) {
        const rect = gameImg.getBoundingClientRect();

        const clickViewportX = e.clientX;
        const clickViewportY = e.clientY;

        const relX = clickViewportX - rect.left;
        const relY = clickViewportY - rect.top;

        const naturalW = gameImg.naturalWidth;
        const naturalH = gameImg.naturalHeight;

        const trueX = (relX / rect.width) * naturalW;
        const trueY = (relY / rect.height) * naturalH;

        lastClickX = Math.round(trueX);
        lastClickY = Math.round(trueY);

        manageImgClick(e);
    }

    clicked = false;
});

function manageImgClick(e) {
    clickMenu.style.display = 'flex';
    clickMenu.style.left = (e.pageX - 25) + 'px';
    clickMenu.style.top = (e.pageY - 25) + 'px';
}

document.querySelectorAll('.click-character-name').forEach(button => {
    button.addEventListener('click', e => {
        const characterId = parseInt(e.target.closest('.click-item').dataset.characterId);

        fetch(`/game/${pictureId}/check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ characterId, lastClickX, lastClickY })
        })
            .then(response => response.json())
            .then(data => {
                if (data.found) {
                    e.target.closest('.click-item').classList.add('found');
                    document.querySelector(`.character-item[data-character-id="${characterId}"]`).classList.add('found');
                }

                if (data?.finish) {
                    showFinishModal(data.time);
                    return;
                }

                showModal(data.message);
                clickMenu.style.display = 'none';
            });
    });
});