import { useQuery } from "@tanstack/react-query";
import { getPostById } from "../api/endpoints/posts";

export function usePost(postId) {
    return useQuery({
        queryKey: ["post", postId],
        queryFn: () => getPostById(postId),
        retry: false,
    });
}