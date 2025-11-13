const uploadPopup = document.querySelector('#upload-popup');
const newFolderPopup = document.querySelector('#new-folder-popup');
const errorPopup = document.getElementById('error-popup');

const overlay = document.querySelector('#popup-overlay');
const uploadButton = document.querySelector('.upload');
const newFolderBtn = document.querySelector('.new-folder');
const closeErrorPopupBtn = document.getElementById('close-error-popup');

newFolderBtn.addEventListener('click', (e) => {
    newFolderPopup.classList.add('visible');
    setTimeout(() => {
        newFolderPopup.querySelector('input').focus();
    }, 200);
    toggleOverlay(true);
});

uploadButton.addEventListener('click', (e) => {
    e.stopPropagation();
    uploadPopup.classList.toggle('visible');
});

closeErrorPopupBtn.addEventListener('click', () => {
    closePopup(errorPopup);
    toggleOverlay(false);
});

overlay.addEventListener('click', () => {
    toggleOverlay(false);
    closeAllVisiblePopups();
});

document.addEventListener('click', (e) => {
    if ((newFolderPopup.classList.contains('visible') && !newFolderPopup.contains(e.target) && e.target !== newFolderBtn) || e.target === document.querySelector('#cancel-new-folder')) {
        closePopup(newFolderPopup);
        toggleOverlay(false);
    }

    if (uploadPopup.classList.contains('visible')) {
        closePopup(uploadPopup);
    }
});

function closePopup(popup) {
    popup.classList.remove('visible');
}

function closeAllVisiblePopups() {
    document.querySelectorAll('.popup.visible').forEach(visiblePopup => {
        closePopup(visiblePopup);
    });
}

export function toggleOverlay(toggle) {
    overlay.classList.toggle('visible', toggle);
}

export function showErrorPopup(title, message) {
    errorPopup.querySelector('.error-title').textContent = title;
    errorPopup.querySelector('.error-message').textContent = message;
    errorPopup.classList.add('visible');
    toggleOverlay(true);
}

export function toggleLoadingOverlay(show, msg) {
    closeAllVisiblePopups();
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.classList.toggle('visible', show);
    if (msg) {
        loadingOverlay.querySelector('.spinner').textContent = msg + '...';
    }
}