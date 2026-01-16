import { api } from "../api/apiClient";

export function isInvalidImageFile(file, maxSizeMB = 5) {
    if (!file) {
        return null;
    }
    if (!(file instanceof File)) {
        return 'Invalid file.';
    }

    if (!file.type || !file.type.startsWith('image/')) {
        return 'Selected file must be an image.';
    }

    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
        return `Image must be smaller than ${maxSizeMB}MB.`;
    }

    return null;
}

export async function uploadFile({ file, signUrl }) {
    const validationError = isInvalidImageFile(file);
    if (validationError) {
        throw new Error(validationError);
    }

    const signed = await api.post(signUrl);
    const form = new FormData();
    form.append('file', file);

    form.append('api_key', signed.apiKey);
    form.append('timestamp', signed.timestamp);
    form.append('signature', signed.signature);
    form.append('folder', signed.folder);
    form.append('public_id', signed.publicId);

    const resp = await fetch(signed.uploadUrl, {
        method: 'POST',
        body: form,
    });

    if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Upload failed: ${resp.status} ${txt}`);
    }

    const data = await resp.json();

    return {
        pictureUrl: data.secure_url || data.url,
        picturePublicId: data.public_id || signed.publicId || null,
    };
}