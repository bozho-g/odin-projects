import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendFollowRequest } from "../api/endpoints/follows";
import { toast } from "sonner";

export function useSendFollowRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId) => sendFollowRequest(userId),
        onSuccess: () => {
            toast.success("Follow request sent", { duration: 3000 });
            queryClient.invalidateQueries({ queryKey: ['users'], });
            queryClient.invalidateQueries({ queryKey: ['user'], });
            queryClient.invalidateQueries({ queryKey: ['followers'], });
            queryClient.invalidateQueries({ queryKey: ['following'], });
            queryClient.invalidateQueries({ queryKey: ['outgoingRequests'], });
        },
        onError: (error) => {
            toast.error(error?.message || 'Failed to send request', { duration: 5000 });
        }
    });
}