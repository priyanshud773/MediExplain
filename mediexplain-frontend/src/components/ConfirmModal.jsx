import { useEffect } from "react";
import { FaTrash, FaExclamationTriangle, FaTimes } from "react-icons/fa";

function ConfirmModal({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = true,
  loading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !loading) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="medical-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onCancel();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="medical-modal-card">
        {/* Close Icon Top Right */}
        <button
          type="button"
          className="modal-close-icon"
          onClick={onCancel}
          disabled={loading}
          aria-label="Close dialog"
        >
          <FaTimes />
        </button>

        {/* Modal Header with Icon */}
        <div className="modal-header">
          <div className={`modal-icon-badge ${isDestructive ? "destructive" : "primary"}`}>
            {isDestructive ? <FaTrash /> : <FaExclamationTriangle />}
          </div>
          <div>
            <h3 id="confirm-modal-title" className="modal-title">
              {title}
            </h3>
            <p className="modal-message">
              {message}
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="modal-actions">
          <button
            type="button"
            className="secondary-btn modal-cancel-btn"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className={isDestructive ? "danger-btn modal-action-btn" : "primary-btn modal-action-btn"}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }}></span>
                <span>Deleting...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
