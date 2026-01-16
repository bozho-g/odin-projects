import { useAuth } from "../../../context/AuthContext";
import { PostEditor } from "./PostEditor";
import { useCreatePostMutation } from "../../../hooks/useCreatePostMutation";
import { useDeletePostImage } from "../../../hooks/useDeletePostImage";
import { useUploadPostImage } from "../../../hooks/useUploadPostImage";
import { toast } from "sonner";
import styles from "./PostEditor.module.css";
import { useState } from "react";

export function CreatePostWrapper() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [editorKey, setEditorKey] = useState(0);

    const createPostMutation = useCreatePostMutation();
    const uploadPostImage = useUploadPostImage();
    const deletePostImage = useDeletePostImage();

    function onSubmit({ content, file }) {
        if (!content && !file?.size) {
            return;
        }

        setIsLoading(true);
        try {
            toast.promise(
                (async () => {
                    let imageUrl = null;
                    let imagePublicId = null;

                    try {
                        if (file?.size > 0) {
                            const { pictureUrl, picturePublicId } = await uploadPostImage.mutateAsync({ file, signUrl: '/cloudinary/sign/post' });
                            imageUrl = pictureUrl;
                            imagePublicId = picturePublicId;
                        }

                        await createPostMutation.mutateAsync({ content: content ? content : null, imageUrl, imagePublicId }
                        );
                    } catch (error) {
                        if (imagePublicId) {
                            try {
                                await deletePostImage.mutateAsync(imagePublicId);
                            } catch (cleanupErr) {
                                console.error("Failed to cleanup image:", cleanupErr);
                            }

                            throw error;
                        }
                    }
                })(),
                {
                    loading: "Posting...",
                    success: "Post created successfully!",
                    error: "Failed to create post. Please try again."
                }
            );

            setEditorKey(prev => prev + 1);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className={styles.postFormContainer}>
            <img className={styles.profilePicture} src={user?.pfpUrl || import.meta.env.VITE_DEFAULT_PFP_URL} alt={user?.username || "User"} />
            <PostEditor
                key={editorKey}
                submitLabel="Post"
                onSubmit={onSubmit}
                isLoading={isLoading}
            />
        </div>
    );
}