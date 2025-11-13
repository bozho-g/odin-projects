import { fileDialog } from './itemActions.js';
import { showErrorPopup, toggleLoadingOverlay, toggleOverlay } from './popups.js';

window.addEventListener('click', (e) => {
    if (!e.target.closest('.actions')) {
        document.querySelectorAll('.item-popup.visible').forEach(visiblePopup => {
            visiblePopup.classList.remove('visible');
        });
    }
});

const deleteEls = document.querySelectorAll('.delete');
const copyEls = document.querySelectorAll('.copy-link-button');
const infoEls = document.querySelectorAll('.file-info-btn');

copyEls.forEach(copyEl => {
    copyEl.addEventListener('click', async (e) => {
        try {
            await navigator.clipboard.writeText(window.location.origin + copyEl.dataset.link);

            copyEl.textContent = 'Copied!';
            setTimeout(() => {
                copyEl.textContent = 'Copy Link';
            }, 2000);
        } catch (error) {
            showErrorPopup('Copy Failed', 'Failed to copy link to clipboard.');
        }
    });
});

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

                const deleteBtn = document.createElement('button');
                deleteBtn.classList.add('item-action', 'delete');
                deleteBtn.dataset.name = data.name;
                deleteBtn.dataset.href = `/files/${data.id}/delete`;
                deleteBtn.dataset.type = 'file';
                deleteBtn.textContent = 'Delete';
                deleteBtn.addEventListener('click', (e) => deleteEventListener(e, deleteBtn));

                fileDialogEl.querySelector('.item-actions').prepend(downloadBtn, deleteBtn);
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

async function deleteEventListener(e, deleteEl) {
    toggleOverlay(true);
    document.querySelectorAll('.delete-popup').forEach(existingPopup => {
        existingPopup.remove();
    });
    document.body.insertAdjacentHTML('beforeend', deletePopup(`Are you sure you want to delete '${deleteEl.dataset.name}' ${deleteEl.dataset.type}?`));

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