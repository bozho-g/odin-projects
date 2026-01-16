import { useMutation, useQueryClient } from "@tanstack/react-query";
import { respondToFollowRequest } from "../api/endpoints/follows";
import { toast } from "sonner";

export function useRespondToRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, accept }) => respondToFollowRequest(userId, accept),
        onSuccess: () => {
            toast.success("Responded to follow request", { duration: 3000 });
            queryClient.invalidateQueries({ queryKey: ['users'], });
            queryClient.invalidateQueries({ queryKey: ['user'], });
            queryClient.invalidateQueries({ queryKey: ['followers'], });
            queryClient.invalidateQueries({ queryKey: ['following'], });
            queryClient.invalidateQueries({ queryKey: ['incomingRequests'], });
        },
        onError: (error) => {
            toast.error(error?.message || 'Failed to respond to request', { duration: 5000 });
        }
    });
}