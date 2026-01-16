import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/apiClient";

export function useUpdateComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ commentId, content }) => api.put(`/comments/${commentId}`, { content }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['post'] });
            queryClient.invalidateQueries({ queryKey: ['comments'] });
        }
    });
}