import { showErrorPopup, toggleLoadingOverlay } from "./popups.js";

const fileInput = document.getElementById('file');
const folderInput = document.getElementById('folder');

fileInput.addEventListener('change', processFilesForms);
folderInput.addEventListener('change', processFilesForms);

function processFilesForms(e) {
    e.preventDefault();
    const fileArray = Array.from(e.target.files);

    const totalSize = fileArray.reduce(
        (accumulator, currentValue) => accumulator + currentValue.size, 0);

    if (totalSize > 50000000) {
        showErrorPopup('File Size Exceeded', 'Total upload size exceeds 50MB limit.');
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
                const errorData = await response.json();

                throw new Error(errorData.message || 'Upload failed');
            }

            window.location.reload();
            toggleLoadingOverlay(false);
        })
        .catch(error => {
            toggleLoadingOverlay(false);
            showErrorPopup('Upload Failed', error.message);
        });
}