import { showErrorPopup, toggleLoadingOverlay } from "./popups.js";

const MAX_SIZE_MB = 4.5;

const fileInput = document.getElementById('file');
const folderInput = document.getElementById('folder');

fileInput.addEventListener('change', processFilesForms);
folderInput.addEventListener('change', processFilesForms);

function processFilesForms(e) {
    e.preventDefault();
    const fileArray = Array.from(e.target.files);

    const totalSize = fileArray.reduce(
        (accumulator, currentValue) => accumulator + currentValue.size, 0);

    if (totalSize > MAX_SIZE_MB * 1024 * 1024) {
        showErrorPopup('File Size Exceeded', `Total upload size exceeds ${MAX_SIZE_MB}MB limit.`);
        return;
    }

    const formData = new FormData(e.target.form);
    const url = e.target.id === 'file' ? '/upload-file' : '/upload-folder';

    toggleLoadingOverlay(true, 'Uploading');
    fetch(url, {
        method: 'POST',
        body: formData
    })
        .then(async response => {
            if (!response.ok) {
                let errorMessage;
                const contentType = response.headers.get('content-type');

                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    errorMessage = data.error || data.message || 'Upload failed';
                } else {
                    const text = await response.text();
                    errorMessage = `Server error: ${response.status} ${response.statusText}`;
                }

                throw new Error(errorMessage);
            }

            window.location.reload();
            toggleLoadingOverlay(false);
        })
        .catch(error => {
            toggleLoadingOverlay(false);
            showErrorPopup('Upload Failed', error.message);
        });
}