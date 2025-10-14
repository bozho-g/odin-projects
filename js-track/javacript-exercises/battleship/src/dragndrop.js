let boardRef = null;
const COLS = 8;
const ROWS = 8;
let currentPreview = [];
let currentDragging = null;
let isDragging = false;
let boardElRef = null;
let previewOverlay = null;
let lastPointerDown = null;

export function initDrag(board) {
    boardRef = board;

    const boardEl = document.querySelector('.board');
    const shipSelector = '.ship-unset';

    if (!boardEl) {
        return;
    }

    boardElRef = boardEl;
    boardEl.style.position = boardEl.style.position || 'relative';

    if (previewOverlay && previewOverlay.parentNode) {
        previewOverlay.parentNode.removeChild(previewOverlay);
        previewOverlay = null;
    }
    previewOverlay = document.createElement('div');
    previewOverlay.className = 'preview-overlay';
    previewOverlay.style.display = 'none';
    previewOverlay.style.pointerEvents = 'none';
    boardEl.appendChild(previewOverlay);

    boardEl.addEventListener('dragover', dragOverHandler);
    boardEl.addEventListener('drop', dropHandler);

    document.querySelectorAll(shipSelector).forEach((ship) => {
        ship.setAttribute('draggable', 'true');
        ship.addEventListener('dragstart', dragStartHandler);
        ship.addEventListener('dragend', dragEndHandler);
        ship.addEventListener('click', toggleOrientation);
        ship.addEventListener('pointerdown', (e) => {
            lastPointerDown = { x: e.clientX, y: e.clientY, target: e.currentTarget };
        });
    });

    boardEl.addEventListener('dragleave', (e) => {
        if (e.target === boardEl) {
            clearPreview();
        }
    });

    document.addEventListener('dragend', () => {
        isDragging = false;
        currentDragging = null;
        clearPreview();
    });
}

function dragStartHandler(e) {
    const target = e.currentTarget || e.target;
    const length = Number(target.dataset.length);
    let orientation = target.dataset.orientation;
    if (!orientation) {
        orientation = target.classList.contains('vertical') ? 'vertical' : 'horizontal';
        target.dataset.orientation = orientation;
    }
    const shipName = target.dataset.name || null;
    const payload = { length, orientation, shipName };

    e.dataTransfer.setData('text/plain', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
    currentDragging = target;
    isDragging = true;
}

function dragEndHandler(e) {
    isDragging = false;
    currentDragging = null;
    clearPreview();
}

function dragOverHandler(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    let payload;
    try {
        payload = JSON.parse(e.dataTransfer.getData('text/plain'));
    } catch {
        clearPreview();
        return;
    }

    const orientation = payload.orientation;

    const cell = e.target.closest('.cell');
    if (!cell) {
        clearPreview();
        return;
    }

    const startX = Number(cell.dataset.x);
    const startY = Number(cell.dataset.y);
    const coords = computeCoords(startX, startY, payload.length, orientation);

    const valid = isValidPlacement(coords);
    applyPreview(coords, valid);
}

function dropHandler(e) {
    e.preventDefault();

    let payload;
    try {
        payload = JSON.parse(e.dataTransfer.getData('text/plain'));
    } catch {
        clearPreview();
        return;
    }

    const orientation = payload.orientation;

    const cell = e.target.closest('.cell');
    if (!cell) {
        clearPreview();
        return;
    }

    const startX = Number(cell.dataset.x);
    const startY = Number(cell.dataset.y);
    const coords = computeCoords(startX, startY, payload.length, orientation);

    if (!isValidPlacement(coords)) {
        applyPreview(coords, false);
        return;
    }

    coords.forEach(([x, y]) => {
        const el = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
        if (el) {
            el.classList.add('ship');
        }

        if (boardRef && Array.isArray(boardRef[x])) {
            boardRef[x][y] = payload.shipName;
        }
    });

    if (payload.shipName) {
        const shipEl = document.querySelector(`[data-name="${payload.shipName}"]`);
        if (shipEl) {
            shipEl.classList.add('disabled');
            shipEl.setAttribute('draggable', 'false');
        }
    } else if (currentDragging) {
        currentDragging.classList.add('disabled');
        currentDragging.setAttribute('draggable', 'false');
    }

    clearPreview();
}

function computeCoords(startX, startY, length, orientation) {
    const coords = [];
    if (orientation === 'vertical') {
        for (let i = 0; i < length; i++) {
            coords.push([startX + i, startY]);
        }
    } else {
        for (let i = 0; i < length; i++) {
            coords.push([startX, startY + i]);
        }
    }
    return coords;
}


function inBounds([x, y]) {
    return x >= 0 && x < ROWS && y >= 0 && y < COLS;
}

function isValidPlacement(coords) {
    for (const c of coords) {
        if (!inBounds(c)) {
            return false;
        }

        const [x, y] = c;
        if (boardRef && Array.isArray(boardRef[x]) && boardRef[x][y]) {
            return false;
        }
    }
    return true;
}

function applyPreview(coords, valid) {
    clearPreview();

    if (!coords || coords.length === 0) {
        hideOverlay();
        return;
    }

    const inBoundsCoords = coords.filter((c) => inBounds(c));
    if (inBoundsCoords.length === 0) {
        hideOverlay();
        return;
    }

    const xs = inBoundsCoords.map((c) => c[0]);
    const ys = inBoundsCoords.map((c) => c[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const firstCell = document.querySelector(`.cell[data-x="${minX}"][data-y="${minY}"]`);
    const lastCell = document.querySelector(`.cell[data-x="${maxX}"][data-y="${maxY}"]`);
    if (!firstCell || !lastCell || !boardElRef) {
        hideOverlay();
        return;
    }

    const boardRect = boardElRef.getBoundingClientRect();
    const firstRect = firstCell.getBoundingClientRect();
    const lastRect = lastCell.getBoundingClientRect();

    const left = firstRect.left - boardRect.left;
    const top = firstRect.top - boardRect.top;
    const width = lastRect.right - firstRect.left;
    const height = lastRect.bottom - firstRect.top;

    previewOverlay.style.display = 'block';
    previewOverlay.style.left = `${left}px`;
    previewOverlay.style.top = `${top}px`;
    previewOverlay.style.width = `${width}px`;
    previewOverlay.style.height = `${height}px`;

    previewOverlay.classList.remove('valid', 'invalid');
    previewOverlay.classList.add(valid ? 'valid' : 'invalid');

    inBoundsCoords.forEach(([x, y]) => {
        const el = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
        if (el) {
            el.classList.add(valid ? 'preview' : 'invalid-preview');
            currentPreview.push(el);
        }
    });
}

function clearPreview() {
    currentPreview.forEach((el) => {
        el.classList.remove('preview', 'invalid-preview');
    });
    currentPreview = [];
    hideOverlay();
}

function hideOverlay() {
    if (previewOverlay) {
        previewOverlay.style.display = 'none';
        previewOverlay.classList.remove('valid', 'invalid');
    }
}

function toggleOrientation(e) {
    const el = e.currentTarget;
    if (el.classList.contains('disabled') || !el.classList.contains('ship-unset')) return;

    if (lastPointerDown && lastPointerDown.target === e.currentTarget) {
        const dx = Math.abs(e.clientX - lastPointerDown.x);
        const dy = Math.abs(e.clientY - lastPointerDown.y);
        const dist = Math.max(dx, dy);
        lastPointerDown = null;
        if (dist > 6) {
            return;
        }
    } else {
        if (isDragging) return;
    }

    const current = el.dataset.orientation || (el.classList.contains('vertical') ? 'vertical' : 'horizontal');
    const next = current === 'horizontal' ? 'vertical' : 'horizontal';
    try {
        const w = el.style.width;
        const h = el.style.height;
        if (w && h) {
            el.style.width = h;
            el.style.height = w;
        }
    } catch (err) { }

    el.dataset.orientation = next;
}