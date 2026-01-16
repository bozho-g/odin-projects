import { useMutation } from "@tanstack/react-query";
import { uploadFile } from "../utils/files";

export function useUploadProfilePicture() {
    return useMutation({
        mutationFn: uploadFile,
    });
}