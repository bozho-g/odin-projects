import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/apiClient";

export function useCreateComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, content }) => api.post('/comments/post/' + postId, { content }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments'] });
            queryClient.invalidateQueries({ queryKey: ['post'] });
        }
    });
}