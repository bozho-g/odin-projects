export function toggleSpinner(toggle) {
    let spinner = document.getElementById('spinner');

    if (!spinner) {
        spinner = document.createElement('div');
        spinner.id = 'spinner';
        spinner.innerHTML = `
            <div class="spinner-bounce" aria-hidden="true">
                <div></div><div></div><div></div>
            </div>
        `;
        document.body.appendChild(spinner);
    }

    spinner.classList.toggle('visible', !!toggle);
}