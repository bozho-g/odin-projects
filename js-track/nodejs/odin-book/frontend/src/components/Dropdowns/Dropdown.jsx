import { useEffect, useRef } from 'react';

export function Dropdown({ children, isOpen, className, onClose }) {
    const ref = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    if (!isOpen) {
        return null;
    }

    return (
        <div data-no-nav ref={ref} className={className} >
            {children}
        </div>
    );
}