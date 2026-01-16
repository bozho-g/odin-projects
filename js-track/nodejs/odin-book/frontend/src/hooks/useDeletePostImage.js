import { useMutation } from "@tanstack/react-query";
import { api } from "../api/apiClient";

export function useDeletePostImage() {
    return useMutation({
        mutationFn: (publicId) => {
            return api.delete('/cloudinary/delete', { publicId });
        },
    });
}
