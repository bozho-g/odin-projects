import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/apiClient";

export function useRegisterMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (credentials) => api.post('/users/register', credentials),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });
};