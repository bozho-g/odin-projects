import { PostEditor } from "./PostEditor";
import styles from "./EditPost.module.css";
import { useState } from "react";
import { useUploadPostImage } from "../../../hooks/useUploadPostImage";
import { useDeletePostImage } from "../../../hooks/useDeletePostImage";
import { toast } from "sonner";
import { useUpdatePostMutation } from "../../../hooks/useUpdatePostMutation";

export function EditPostWrapper({ post, onCancel }) {
    const [isLoading, setIsLoading] = useState(false);

    const updatePostMutation = useUpdatePostMutation();
    const uploadPostImage = useUploadPostImage();
    const deletePostImage = useDeletePostImage();

    async function onSubmit({ content, file, imageUrl, imageChanged }) {
        if (!content && !file?.size && !imageChanged) {
            return;
        }

        setIsLoading(true);
        try {
            const updatePromise = (async () => {
                let imageUrlToSend = post.imageUrl;
                let imagePublicIdToSend = post.imagePublicId;
                let uploadedPublicId = null;

                try {
                    if (file?.size > 0) {
                        const { pictureUrl, picturePublicId } = await uploadPostImage.mutateAsync({ file, signUrl: '/cloudinary/sign/post' });
                        imageUrlToSend = pictureUrl;
                        imagePublicIdToSend = picturePublicId;
                        uploadedPublicId = picturePublicId;
                    } else if (imageChanged && !imageUrl) {
                        imageUrlToSend = null;
                        imagePublicIdToSend = null;
                    }

                    await updatePostMutation.mutateAsync({ postId: post.id, postData: { content: content ? content : null, imageUrl: imageUrlToSend, imagePublicId: imagePublicIdToSend } }
                    );
                } catch (error) {
                    if (uploadedPublicId) {
                        try {
                            await deletePostImage.mutateAsync(uploadedPublicId);
                        } catch (cleanupErr) {
                            console.error("Failed to cleanup image:", cleanupErr);
                        }

                        throw error;
                    }

                    throw error;
                }
            })();

            toast.promise(updatePromise,
                {
                    loading: "Saving...",
                    success: "Post updated successfully!",
                    error: "Failed to update post. Please try again."
                }
            );

            await updatePromise;

            onCancel?.();
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className={styles.editFormContainer}>
            <PostEditor
                initialContent={post.content}
                initialImageUrl={post.imageUrl}
                submitLabel="Save"
                placeholder="Edit your post..."
                onCancel={onCancel}
                onSubmit={onSubmit}
                isLoading={isLoading}
            />
        </div>
    );
}