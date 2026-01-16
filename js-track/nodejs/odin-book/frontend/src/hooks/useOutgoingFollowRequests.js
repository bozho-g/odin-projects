import { useQuery } from "@tanstack/react-query";
import { getOutgoingFollows } from "../api/endpoints/follows";

export function useOutgoingFollowRequests() {
    return useQuery({
        queryKey: ['outgoingRequests'],
        queryFn: getOutgoingFollows
    });
}