import { useMutation } from "@tanstack/react-query";
import { uploadFile } from "../utils/files";

export function useUploadPostImage() {
    return useMutation({
        mutationFn: uploadFile,
    });
}