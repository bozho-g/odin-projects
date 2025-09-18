const container = document.querySelector(".container");
const changeBtn = document.querySelector("#changeBtn");

function buildGrid(n) {
    const size = Math.min(Math.max(parseInt(n) || 0, 1), 100);
    container.innerHTML = "";
    container.style.setProperty('--n', size);

    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-item');
        container.appendChild(cell);
    }
}

changeBtn.addEventListener('click', () => {
    const input = prompt('Enter grid size (1-100):');
    if (input == null || isNaN(input) || input < 1 || input > 100) {
        alert("Please enter a valid number between 1 and 100.");
        return;
    }

    buildGrid(input);
});

buildGrid(16);
