import { useQuery } from "@tanstack/react-query";
import { getFollowers } from "../api/endpoints/follows";

export function useFollowers(username, enabled) {
    return useQuery({
        queryKey: ['followers', username],
        queryFn: () => getFollowers(username),
        enabled
    });
};  