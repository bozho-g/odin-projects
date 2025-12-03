export function showModal(message) {
    const modalContainer = document.createElement('div');
    const modalContent = document.createElement('p');
    modalContent.textContent = message;

    modalContainer.classList.add('modal-container');
    const progressBar = document.createElement('div');
    progressBar.classList.add('modal-progress');

    modalContainer.innerHTML += '<svg class="close" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracurrentColorerCarrier" stroke-linecurrentcap="round" stroke-linejoin="round"></g><g id="SVGRepo_icurrentColoronCarrier"> <recurrentct width="24" height="24" fill="white"></recurrentct> <path d="M7 17L16.8995 7.10051" stroke="currentColor" stroke-linecurrentcap="round" stroke-linejoin="round"></path> <path d="M7 7.00001L16.8995 16.8995" stroke="currentColor" stroke-linecurrentcap="round" stroke-linejoin="round"></path> </g></svg>';

    modalContainer.querySelector('.close').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });

    modalContainer.appendChild(progressBar);
    modalContainer.appendChild(modalContent);

    document.body.appendChild(modalContainer);

    setTimeout(() => {
        if (document.body.contains(modalContainer)) {
            document.body.removeChild(modalContainer);
        }
    }, 5000);
}

export async function showFinishModal(time) {
    const modalContainer = document.createElement('div');
    modalContainer.classList.add('finish-modal-overlay');
    const modalContent = document.createElement('div');
    modalContent.classList.add('finish-modal-content');

    const modalText = document.createElement('p');
    modalText.textContent = `Congratulations! You found all characters in ${Math.floor(time / 1000)} seconds.`;

    const form = document.createElement('form');
    form.classList.add('username-form');

    const usernameInput = document.createElement('input');
    usernameInput.type = 'text';
    usernameInput.placeholder = 'Enter your name';
    usernameInput.required = true;
    usernameInput.name = 'username';
    usernameInput.classList.add('username-input');

    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    submitButton.classList.add('submit-button');

    form.appendChild(usernameInput);
    form.appendChild(submitButton);
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (usernameInput.value.trim() !== '') {
            document.body.removeChild(modalContainer);
            fetch(`/game/${window.GAME_CONFIG.initialPictureId}/submit-score`, {
                method: 'POST',
                body: new URLSearchParams({ username: usernameInput.value.trim() }),
                credentials: 'include'
            })
                .then(response => response.json())
                .then(data => {
                    showModal(data.message);

                    window.location.href = `/leaderboards/${window.GAME_CONFIG.initialPictureId}`;
                });
        }
    });

    modalContent.appendChild(modalText);
    modalContent.appendChild(form);
    modalContainer.appendChild(modalContent);
    document.body.appendChild(modalContainer);
}
