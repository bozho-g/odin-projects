import { createContext, useCallback, useContext, useState } from "react";
import { EditProfileModal } from "../components/EditProfileModal";

const EditProfileContext = createContext();

export function EditProfileProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);

    const openEditor = useCallback(() => {
        setIsOpen(true);
    }, []);

    return (
        <EditProfileContext.Provider value={{ isOpen, setIsOpen, openEditor }}>
            {children}
            {isOpen && <EditProfileModal isOpen={isOpen} onClose={() => setIsOpen(false)} />}
        </EditProfileContext.Provider>
    );
}

export function useEditProfile() {
    return useContext(EditProfileContext);
}