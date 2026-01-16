import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/apiClient";

export function useDeleteComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (commentId) => api.delete(`/comments/${commentId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments'] });
            queryClient.invalidateQueries({ queryKey: ['post'] });
        }
    });
};