import { useQuery } from "@tanstack/react-query";
import { getIncomingFollows } from "../api/endpoints/follows";

export function useIncomingFollowRequests() {
    return useQuery({
        queryKey: ['incomingRequests'],
        queryFn: getIncomingFollows
    });
}