import { useEffect, useState } from "react";

export default function WakeBanner({
    storageKey = "wakeBannerDismissed",
    message = "The server may take 30-60 seconds to wake up on the first request.",
}) {
    const [visible, setVisible] = useState(() => {
        try {
            return localStorage.getItem(storageKey) !== "1";
        } catch {
            return true;
        }
    });

    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === storageKey) {
                setVisible(e.newValue !== "1");
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [storageKey]);

    const dismiss = () => {
        try {
            localStorage.setItem(storageKey, "1");
        } catch {
            //
        }
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="wake-banner" role="status" aria-live="polite">
            <div className="wake-banner-inner">
                <strong>Heads up:</strong> {message}
            </div>
            <button className="wake-banner-dismiss" onClick={dismiss} aria-label="Dismiss">
                ✕
            </button>
        </div>
    );
}
