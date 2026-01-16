import { api } from "../apiClient";

export async function getUserByUsername(username) {
    return api.get(`/users/username/${username}`);
}

export async function getUsers() {
    return api.get('/users');
};

export default { getUserByUsername, getUsers };