const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
let onUnauthorized = null;

export function setOnUnauthorized(handler) {
    onUnauthorized = handler;
}

async function request(path, { method = 'GET', body } = {}) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    let data = await res.json();

    if (!res.ok) {
        if (res.status === 401 && onUnauthorized) {
            onUnauthorized();
        }

        throw new Error(data.message || data.errors || 'API request failed');
    }

    return data;
}

export const api = {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: 'POST', body }),
    patch: (path, body) => request(path, { method: 'PATCH', body }),
    delete: (path, body) => request(path, { method: 'DELETE', body }),
};