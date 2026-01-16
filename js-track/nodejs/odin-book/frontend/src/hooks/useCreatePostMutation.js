import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "../api/endpoints/posts";

export function useCreatePostMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postData) => createPost(postData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
    });
}