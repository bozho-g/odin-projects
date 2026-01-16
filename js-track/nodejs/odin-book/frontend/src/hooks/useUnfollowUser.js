import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unFollowUser } from "../api/endpoints/follows";
import { toast } from "sonner";

export function useUnfollowUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId) => unFollowUser(userId),
        onSuccess: () => {
            toast.success("Unfollowed user", { duration: 3000 });
            queryClient.invalidateQueries({ queryKey: ['users'], });
            queryClient.invalidateQueries({ queryKey: ['user'], });
            queryClient.invalidateQueries({ queryKey: ['followers'], });
            queryClient.invalidateQueries({ queryKey: ['following'], });
        },
        onError: (error) => {
            toast.error(error?.message || 'Failed to unfollow user', { duration: 5000 });
        }
    });
}