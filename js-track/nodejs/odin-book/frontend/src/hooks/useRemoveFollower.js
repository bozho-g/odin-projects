import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeFollower } from "../api/endpoints/follows";
import { toast } from "sonner";

export function useRemoveFollower() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId) => removeFollower(userId),
        onSuccess: () => {
            toast.success("Follower removed", { duration: 3000 });
            queryClient.invalidateQueries({ queryKey: ['users'], });
            queryClient.invalidateQueries({ queryKey: ['user'], });
            queryClient.invalidateQueries({ queryKey: ['followers'], });
            queryClient.invalidateQueries({ queryKey: ['following'], });
        },
        onError: (error) => {
            toast.error(error?.message || 'Failed to remove follower', { duration: 5000 });
        }
    });
}