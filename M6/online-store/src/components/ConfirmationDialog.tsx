import { ReactNode } from "react";
import "../App.css";
type ConfirmationDialogProps = {
  isOpen: boolean;
  title: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "neutral";
};
export const ConfirmationDialog = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "neutral",
}: ConfirmationDialogProps) => {
  if (!isOpen) return null;
  return (
    <div className="confirmation-dialog-backdrop">
      <div className="confirmation-dialog-container">
        <div className="confirmation-dialog-content">
          <h3 className="confirmation-dialog-title">{title}</h3>
          <div className="confirmation-dialog-message">{message}</div>
        </div>
        <div className="confirmation-dialog-actions">
          <button
            type="button"
            className={`confirmation-dialog-button confirm-button ${variant}`}
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
          >
            {confirmText}
          </button>
          <button
            type="button"
            className="confirmation-dialog-button cancel-button"
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};
