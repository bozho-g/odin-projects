import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePost } from "../api/endpoints/posts";

export function useUpdatePostMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, postData }) => updatePost(postId, postData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
    });
}