import { useMutation } from "@tanstack/react-query";
import { api } from "../api/apiClient";

export function useLoginMutation() {
    return useMutation({
        mutationFn: (credentials) => api.post('/users/login', credentials)
    });
};