import { api } from "../apiClient";

export async function getFollowers(username) {
    return api.get(`/follows/followers?username=` + username);
}

export async function getFollowing(username) {
    return api.get(`/follows/following?username=` + username);
}

export async function sendFollowRequest(userId) {
    return api.post(`/follows/` + userId);
}

export async function unFollowUser(userId) {
    return api.delete(`/follows/` + userId);
}

export async function cancelFollowRequest(userId) {
    return api.delete(`/follows/` + userId + `/request`);
}

export async function respondToFollowRequest(userId, accept) {
    return api.put(`/follows/` + userId + `/respond`, { accept });
}

export async function removeFollower(userId) {
    return api.delete(`/follows/` + userId + `/remove`);
}

export async function getIncomingFollows() {
    return api.get(`/follows/incoming`);
}

export async function getOutgoingFollows() {
    return api.get(`/follows/outgoing`);
}

export default {
    getFollowers,
    getFollowing,
    sendFollowRequest,
    unFollowUser,
    cancelFollowRequest,
    respondToFollowRequest,
    getIncomingFollows,
    getOutgoingFollows
};