import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/apiClient";

export function useToggleLikeComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ commentId }) => api.post(`/comments/${commentId}/like`),
        onSuccess: (data, variables) => {
            const { commentId } = variables;
            const { liked, likeCount } = data;

            queryClient.invalidateQueries({ queryKey: ['comments'] });
            queryClient.invalidateQueries({ queryKey: ['post'] });
            queryClient.invalidateQueries({ queryKey: ['posts'] });

            queryClient.setQueriesData(
                { predicate: (query) => query.queryKey[0] === 'comments' },
                (old) => {
                    if (!old) return old;
                    return old.map(comment =>
                        comment.id === commentId
                            ? {
                                ...comment,
                                likedByMe: liked,
                                _count: {
                                    ...comment._count,
                                    likes: likeCount
                                }
                            }
                            : comment
                    );
                }
            );
        },
    });
}