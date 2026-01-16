import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleLikePost } from "../api/endpoints/posts";

export function useToggleLikePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId }) => toggleLikePost(postId),
        onMutate: async ({ postId }) => {
            await queryClient.cancelQueries({ queryKey: ['post', postId] });
            await queryClient.cancelQueries({ queryKey: ['posts'] });

            const previousPost = queryClient.getQueryData(['post', postId]);
            const previousPostsQueries = queryClient.getQueriesData({
                predicate: (query) => query.queryKey[0] === 'posts',
            });

            const findFromPostsQueries = () => {
                for (const [, data] of previousPostsQueries) {
                    if (!Array.isArray(data)) continue;
                    const found = data.find((p) => p?.id === postId);
                    if (found) return found;
                }
                return null;
            };

            const source = previousPost ?? findFromPostsQueries();
            const currentLiked = source?.likedByMe ?? false;
            const currentCount = source?._count?.likes ?? 0;
            const nextLiked = !currentLiked;
            const nextCount = Math.max(0, currentCount + (nextLiked ? 1 : -1));

            queryClient.setQueryData(['post', postId], (old) => {
                if (!old) return old;
                return {
                    ...old,
                    likedByMe: nextLiked,
                    _count: {
                        ...(old._count ?? {}),
                        likes: nextCount,
                    },
                };
            });

            queryClient.setQueriesData(
                { predicate: (query) => query.queryKey[0] === 'posts' },
                (old) => {
                    if (!Array.isArray(old)) return old;
                    return old.map((p) =>
                        p?.id === postId
                            ? {
                                ...p,
                                likedByMe: nextLiked,
                                _count: {
                                    ...(p._count ?? {}),
                                    likes: nextCount,
                                },
                            }
                            : p
                    );
                }
            );

            return { previousPost, previousPostsQueries };
        },
        onError: (_err, variables, context) => {
            const postId = variables?.postId;
            if (!postId || !context) return;

            queryClient.setQueryData(['post', postId], context.previousPost);
            for (const [queryKey, data] of context.previousPostsQueries ?? []) {
                queryClient.setQueryData(queryKey, data);
            }
        },
        onSuccess: (data, variables) => {
            const postId = variables.postId;
            const { liked, likeCount } = data;

            queryClient.setQueryData(['post', postId], (old) => {
                if (!old) return old;
                return {
                    ...old,
                    likedByMe: liked,
                    _count: {
                        ...(old._count ?? {}),
                        likes: likeCount,
                    },
                };
            });

            queryClient.setQueriesData(
                { predicate: (query) => query.queryKey[0] === 'posts' },
                (old) => {
                    if (!Array.isArray(old)) return old;
                    return old.map((p) =>
                        p?.id === postId
                            ? {
                                ...p,
                                likedByMe: liked,
                                _count: {
                                    ...(p._count ?? {}),
                                    likes: likeCount,
                                },
                            }
                            : p
                    );
                }
            );
        },
        onSettled: (_data, _err, variables) => {
            const postId = variables?.postId;
            if (!postId) return;
            queryClient.invalidateQueries({ queryKey: ['post', postId] });
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
    });
}