import { useQuery } from "@tanstack/react-query";
import { api } from "../api/apiClient";

export default function useComments(postId) {
    return useQuery({
        queryKey: ['comments', postId],
        queryFn: async () => api.get('/comments/post/' + postId),
    });
}