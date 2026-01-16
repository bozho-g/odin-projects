import { api } from '../apiClient';

export async function getPosts({ userId, username, feed } = {}) {
    if (userId) {
        return api.get(`/posts/user/${userId}`);
    }

    if (username) {
        return api.get(`/posts/user/username/${username}`);
    }

    if (feed) {
        return api.get(`/posts/feed`);
    }

    return api.get(`/posts`);
}

export async function getPostById(postId) {
    return api.get(`/posts/${postId}`);
}

export async function createPost(postData) {
    return api.post('/posts', postData);
}

export async function updatePost(postId, postData) {
    return api.put(`/posts/${postId}`, postData);
}

export async function deletePost(postId) {
    return api.delete(`/posts/${postId}`);
}

export async function toggleLikePost(postId) {
    return api.post(`/posts/${postId}/like`);
}

export default {
    getPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
};
