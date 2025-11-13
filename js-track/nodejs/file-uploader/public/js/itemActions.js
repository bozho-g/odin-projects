import { showErrorPopup, toggleLoadingOverlay, toggleOverlay } from './popups.js';

const actionEls = document.querySelectorAll('.actions');

actionEls.forEach(actionEl => {
    actionEl.addEventListener('click', () => {
        document.querySelectorAll('.item-popup.visible').forEach(visiblePopup => {
            if (visiblePopup !== actionEl.nextElementSibling) {
                visiblePopup.classList.remove('visible');
            }
        });

        const itemPopup = actionEl.nextElementSibling;
        itemPopup.classList.toggle('visible');
    });
});

window.addEventListener('click', (e) => {
    if (!e.target.closest('.actions')) {
        document.querySelectorAll('.item-popup.visible').forEach(visiblePopup => {
            visiblePopup.classList.remove('visible');
        });
    }
});

const deleteEls = document.querySelectorAll('.delete');
const shareEls = document.querySelectorAll('.share');
const infoEls = document.querySelectorAll('.file-info-btn');

infoEls.forEach(infoEl => {
    infoEl.addEventListener('click', async (e) => {

        document.querySelectorAll('.file-dialog').forEach(existingPopup => {
            existingPopup.remove();
        });
        document.body.insertAdjacentHTML('beforeend', fileDialog({ name: 'Loading...', size: '', type: '', uploadedAt: '' }));

        const fileDialogEl = document.querySelector('.file-dialog');

        fileDialogEl.showModal();
        await fetch(infoEl.dataset.href)
            .then(async response => {
                if (!response.ok) {
                    const errorData = await response.json();

                    throw new Error(errorData.message || 'Fetch info failed');
                }

                const data = await response.json();

                fileDialogEl.querySelector('.file-info').innerHTML = `
                    <p><strong>Name:</strong> ${data.name}</p>
                    <p><strong>Size:</strong> ${data.size} bytes</p>
                    <p><strong>Type:</strong> ${data.mimeType}</p>
                    <p><strong>Uploaded At:</strong> ${new Date(data.createdAt).toLocaleString()}</p>
                    <div class="item-actions">
                     
                    </div>
                `;

                const downloadBtn = document.createElement('a');
                downloadBtn.classList.add('item-action', 'download');
                downloadBtn.href = `/files/${data.id}/download`;
                downloadBtn.textContent = 'Download';

                const shareBtn = document.createElement('button');
                shareBtn.classList.add('item-action', 'share');
                shareBtn.dataset.id = data.id;
                shareBtn.dataset.href = `/files/${data.id}/share`;
                shareBtn.textContent = 'Share';
                shareBtn.addEventListener('click', (e) => shareEventListener(e, shareBtn));

                const deleteBtn = document.createElement('button');
                deleteBtn.classList.add('item-action', 'delete');
                deleteBtn.dataset.name = data.name;
                deleteBtn.dataset.href = `/files/${data.id}/delete`;
                deleteBtn.textContent = 'Delete';
                deleteBtn.addEventListener('click', (e) => deleteEventListener(e, deleteBtn));

                fileDialogEl.querySelector('.item-actions').prepend(downloadBtn, shareBtn, deleteBtn);
            })
            .catch(error => {
                fileDialogEl.remove();
                showErrorPopup('Fetch Info Failed', error.message);
            });
    });
});

deleteEls.forEach(deleteEl => {
    deleteEl.addEventListener('click', (e) => deleteEventListener(e, deleteEl));
});

shareEls.forEach(shareEl => {
    shareEl.addEventListener('click', (e) => shareEventListener(e, shareEl));
});

async function shareEventListener(e, shareEl) {
    toggleOverlay(true);
    document.querySelectorAll('.share-popup').forEach(existingPopup => {
        existingPopup.remove();
    });
    document.body.insertAdjacentHTML('beforeend', sharePopup);

    const sharePopupEl = document.querySelector('.share-popup');
    const cancelBtn = sharePopupEl.querySelector('#cancel-share');
    const generateLinkBtn = sharePopupEl.querySelector('#generate-link');

    cancelBtn.addEventListener('click', () => {
        sharePopupEl.remove();
        toggleOverlay(false);
    });

    generateLinkBtn.addEventListener('click', async () => {
        const expirationDate = sharePopupEl.querySelector('input[name="date"]:checked').value;
        sharePopupEl.querySelector('div').classList.add('cursor-not-allowed');
        sharePopupEl.querySelectorAll('label').forEach(label => {
            label.classList.add('no-pointer-events');
        });

        await fetch(shareEl.dataset.href, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ expiration: expirationDate }),
        }).then(async response => {
            if (!response.ok) {
                const errorData = await response.json();

                throw new Error(errorData.message || 'Share failed');
            }

            const data = await response.json();

            const inputEl = sharePopupEl.querySelector('input[type="text"]');
            const copyLinkBtn = sharePopupEl.querySelector('#copy-link');

            copyLinkBtn.classList.remove('hidden');
            inputEl.value = window.location.origin + data.url;
            inputEl.classList.remove('hidden');
            generateLinkBtn.classList.add('hidden');

            copyLinkBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(inputEl.value).then(() => {
                    copyLinkBtn.textContent = 'Copied!';
                });
            });
        }).catch(error => {
            sharePopupEl.remove();
            toggleOverlay(false);

            showErrorPopup('Share Failed', error.message);
        });
    });
}

async function deleteEventListener(e, deleteEl) {
    toggleOverlay(true);
    document.querySelectorAll('.delete-popup').forEach(existingPopup => {
        existingPopup.remove();
    });
    document.body.insertAdjacentHTML('beforeend', deletePopup(`Are you sure you want to delete '${deleteEl.dataset.name}'?`));

    const deletePopupEl = document.querySelector('.delete-popup');
    const cancelBtn = deletePopupEl.querySelector('#cancel-delete');
    const form = deletePopupEl.querySelector('form');

    cancelBtn.addEventListener('click', () => {
        deletePopupEl.remove();
        toggleOverlay(false);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        toggleLoadingOverlay(true, 'Deleting');
        const formData = new FormData(e.target.form);
        await fetch(deleteEl.dataset.href, {
            method: 'POST',
            body: formData,
        }).then(async response => {
            if (!response.ok) {
                const errorData = await response.json();

                throw new Error(errorData.message || 'Delete failed');
            }

            window.location.reload();
            toggleLoadingOverlay(false);
        }).catch(error => {
            deletePopupEl.remove();
            toggleOverlay(false);
            toggleLoadingOverlay(false);
            showErrorPopup('Delete Failed', error.message);
        });
    });
}

const deletePopup = (msg) => `
<div class="delete-popup new-folder-popup popup visible">
    <p class="delete-msg">${msg}</p>
    <form>
      <div class="buttons">
            <button class="btn dim" type="button" id="cancel-delete">Cancel</button>
            <button class="btn delete-btn" type="submit">Delete</button>
        </div>
    </form>
</div>
`;

const sharePopup = `
<div class="share-popup new-folder-popup popup visible">
    <h2 class="popup-title">Share Public Link</h2>

    <fieldset>
        <legend>Generate a shareable link for this item:</legend>
        <div>
            <input type="radio" id="dateChoice1" name="date" value="1" checked />
            <label for="dateChoice1">1 hour</label>

            <input type="radio" id="dateChoice2" name="date" value="4" />
            <label for="dateChoice2">4 hours</label>

            <input type="radio" id="dateChoice3" name="date" value="24" />
            <label for="dateChoice3">1 day</label>

            <input type="radio" id="dateChoice4" name="date" value="72" />
            <label for="dateChoice4">3 days</label>

            <input type="radio" id="dateChoice5" name="date" value="168" />
            <label for="dateChoice5">1 week</label>
        </div>
        <p class="help-text"></p>
    </fieldset>
    <input type="text" readonly placeholder="Link" class="hidden copy-link" />
    <div class="buttons">
        <button class="btn dim" type="button" id="cancel-share">Cancel</button>
        <button class="btn" type="button" id="generate-link">Generate Link</button>
        <button class="btn hidden" type="button" id="copy-link">Copy Link</button>
    </div>
</div>
`;

export const fileDialog = (file) => `
<dialog class="file-dialog" closedby="any">
  <h2 class="dialog-title">File Information</h2>
  <form method="dialog">
  <div class="file-info">
    <p><strong>Name:</strong> ${file.name}</p>
    <p><strong>Size:</strong> ${file.size} bytes</p>
    <p><strong>Type:</strong> ${file.type}</p>
    <p><strong>Uploaded At:</strong> ${new Date(file.uploadedAt).toLocaleString()}</p>
    </div>
    <button class="close"><svg class="close-svg" width="34px" height="34px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M7 17L16.8995 7.10051" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M7 7.00001L16.8995 16.8995" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></g></svg></button>
    </form>
</dialog>
`;