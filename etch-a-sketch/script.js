const container = document.querySelector(".container");
const changeBtn = document.querySelector("#changeBtn");
const clearBtn = document.querySelector("#clear");
const modeToggle = document.querySelector('#modeToggle');
const colorPicker = document.querySelector('#colorPicker');
const eraseToggle = document.querySelector('#eraseToggle');

let isDrawing = false;
let isErasing = false;
let size = 16;
let mode = 'color';

function buildGrid(n) {
    size = Math.min(Math.max(parseInt(n) || 0, 1), 100);
    container.innerHTML = "";
    container.style.setProperty('--n', size);

    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-item');
        cell.setAttribute('draggable', 'false');
        container.appendChild(cell);
    }
}

function getRainbowColor(index) {
    const hue = (performance.now() / 10 + index * 7) % 360;
    return `hsl(${hue}, 95%, 55%)`;
}

function getRandomColor() {
    return `#${Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0')}`;
}

function shadeColor(el) {
    let level = parseInt(el.dataset.shade || '0', 10);
    if (level < 10) {
        level += 1;
    }

    el.dataset.shade = level;
    const pct = 100 - level * 10;
    el.style.backgroundColor = `hsl(0 0% ${pct}%)`;
}

function colorCell(el) {
    if (!el || !el.classList.contains('grid-item')) {
        return;
    }

    if (isErasing) {
        el.style.backgroundColor = 'antiquewhite';
        el.dataset.shade = '0';
        return;
    }

    switch (mode) {
        case 'color':
            el.style.backgroundColor = colorPicker.value;
            break;
        case 'rainbow':
            const idx = Array.prototype.indexOf.call(container.children, el);
            el.style.backgroundColor = getRainbowColor(idx);
            break;
        case 'random':
            el.style.backgroundColor = getRandomColor();
            break;
        case 'shade':
            shadeColor(el);
            break;
    }
}

container.addEventListener('mousedown', (e) => {
    isDrawing = true;
    colorCell(e.target);
});

container.addEventListener('mouseover', (e) => {
    if (!isDrawing) return;
    colorCell(e.target);
});

document.addEventListener('mouseup', () => { isDrawing = false; });
container.addEventListener('mouseleave', () => { isDrawing = false; });
container.addEventListener('dragstart', (e) => e.preventDefault());

changeBtn.addEventListener('click', () => {
    const input = prompt('Enter grid size (1-100):');
    if (input == null || isNaN(input) || input < 1 || input > 100) {
        alert("Please enter a valid number between 1 and 100.");
        return;
    }

    buildGrid(input);
});

clearBtn.addEventListener("click", () => {
    buildGrid(size);
});

modeToggle.addEventListener('click', () => {
    const modes = ['color', 'rainbow', 'random', 'shade'];
    const nextIndex = (modes.indexOf(mode) + 1) % modes.length;
    mode = modes[nextIndex];
    modeToggle.dataset.mode = mode;
    modeToggle.textContent = `Mode: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
});

eraseToggle.addEventListener('click', () => {
    isErasing = !isErasing;
    eraseToggle.textContent = `Erasing: ${isErasing ? 'On' : 'Off'}`;
    container.classList.toggle('erase', isErasing);
});

buildGrid(size);
