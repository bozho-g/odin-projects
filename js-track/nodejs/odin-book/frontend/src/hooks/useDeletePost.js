import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePost } from "../api/endpoints/posts";

export function useDeletePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (postId) => deletePost(postId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['post'] });
        }
    });
};