const API_BASE_URL = 'https://odin-projects-production.up.railway.app/api';

const api = async (endpoint, options = {}) => {
    const token = localStorage.getItem('accessToken');
    const config = {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        }
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 401 && endpoint !== '/api/refresh') {
        const refreshed = await refreshToken();

        if (refreshed) {
            return api(endpoint, options);
        } else {
            throw new Error('Unauthorized');
        }
    }

    return response;
};

const refreshToken = async () => {
    try {
        const response = await api('/refresh', {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            const { accessToken, user } = await response.json();
            localStorage.setItem('accessToken', accessToken);

            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
            }

            window.location.reload();
            return true;
        }
    } catch (err) {
        console.error('Failed to refresh token', err);
    }

    return false;
};

const login = async (username, password) => {
    const response = await api('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data.user;
    }

    throw new Error(data.message || 'Login failed');
};

const logout = async () => {
    await api('/logout', { method: 'POST' });

    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
};

export { api, login, logout };