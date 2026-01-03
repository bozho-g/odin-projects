import { toast } from "sonner";
import useGroupActions from "../../hooks/useGroupActions";
import Modal from "../common/Modal";
import { useChat } from "../../contexts/chatContext";

export default function RenameGroupModal({ onClose }) {
    const { currentChat } = useChat();
    const { renameGroup } = useGroupActions();

    const handleRename = async (e) => {
        e.preventDefault();
        const newName = e.target.groupName.value.trim();
        if (newName === "" || newName === currentChat.name) {
            onClose();
            return;
        }

        await renameGroup(currentChat.id, newName)
            .then(() => {
                onClose();
            })
            .catch((err) => {
                toast.error(err.message || "Failed to rename group", { duration: 4000 });
            });
    };

    return (
        <Modal title="Rename Group" onClose={onClose}>
            <form className="form" onSubmit={handleRename}>
                <div className="input-box">
                    <input type="text" id="groupName" name="groupName" defaultValue={currentChat.name} required minLength={1} autoFocus />
                </div>

                <div className="form-actions">
                    <button type="submit" className="primary btn">Save</button>
                    <button type="button" className="secondary-btn cancel-btn" onClick={onClose}>Cancel</button>
                </div>
            </form>
        </Modal>
    );
}