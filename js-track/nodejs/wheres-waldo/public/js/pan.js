import { gameImg, clickMenu } from './game.js';

export function initPanzoom() {
    const pan = panzoom(gameImg, {
        maxZoom: 1.5,
        minZoom: 0.8,
        bounds: true,
        boundsPadding: 0.2,
        transformOrigin: { x: 0, y: 0 }
    });

    pan.on('pan', function (e) {
        clickMenu.style.display = 'none';
    });

    pan.on('zoom', function (e) {
        clickMenu.style.display = 'none';
    });
}