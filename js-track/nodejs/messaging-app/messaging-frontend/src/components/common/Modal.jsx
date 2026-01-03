export default function Modal({ title, onClose, children, footer, closeOnBackdrop = true }) {
  const handleBackdropClick = () => {
    if (closeOnBackdrop && onClose) onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {title && <h3>{title}</h3>}
        {children}
        {footer}
      </div>
    </div>
  );
}
