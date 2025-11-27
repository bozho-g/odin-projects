import { usePosts } from "../contexts/postsContext";

function Modal({ children }) {
    const { isModalOpen, closeModal } = usePosts();
    if (!isModalOpen) return null;

    return (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}

export default Modal;