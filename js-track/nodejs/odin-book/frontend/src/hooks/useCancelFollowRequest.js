import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelFollowRequest } from "../api/endpoints/follows";
import { toast } from "sonner";

export function useCancelFollowRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId) => cancelFollowRequest(userId),
        onSuccess: () => {
            toast.success("Follow request canceled", { duration: 3000 });
            queryClient.invalidateQueries({ queryKey: ['users'], });
            queryClient.invalidateQueries({ queryKey: ['user'], });
            queryClient.invalidateQueries({ queryKey: ['followers'], });
            queryClient.invalidateQueries({ queryKey: ['following'], });
            queryClient.invalidateQueries({ queryKey: ['outgoingRequests'], });
        },
        onError: (error) => {
            toast.error(error?.message || 'Failed to cancel request', { duration: 5000 });
        }
    });
}