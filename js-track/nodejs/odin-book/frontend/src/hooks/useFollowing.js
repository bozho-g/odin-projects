import { useQuery } from "@tanstack/react-query";
import { getFollowing } from "../api/endpoints/follows";

export function useFollowing(username, enabled) {
    return useQuery({
        queryKey: ['following', username],
        queryFn: () => getFollowing(username),
        enabled
    });
};  