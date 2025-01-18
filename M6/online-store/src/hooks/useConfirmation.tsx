import { useState, useCallback } from "react";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
export const useConfirmation = () => {
  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    onConfirm: (() => Promise<void>) | (() => void);
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "neutral";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const confirm = useCallback(
    (config: {
      title: string;
      message: React.ReactNode;
      onConfirm: (() => Promise<void>) | (() => void);
      confirmText?: string;
      cancelText?: string;
      variant?: "danger" | "warning" | "neutral";
    }) => {
      setConfirmationState({
        isOpen: true,
        ...config,
      });
    },
    []
  );
  const handleConfirm = useCallback(async () => {
    try {
      await confirmationState.onConfirm();
    } catch (error) {
      console.error("Confirmation action failed:", error);
    } finally {
      setConfirmationState((prev) => ({ ...prev, isOpen: false }));
    }
    // esl
  }, [confirmationState]);
  const handleCancel = useCallback(() => {
    setConfirmationState((prev) => ({ ...prev, isOpen: false }));
  }, []);
  const Confirmation = useCallback(
    () => (
      <ConfirmationDialog
        isOpen={confirmationState.isOpen}
        title={confirmationState.title}
        message={confirmationState.message}
        confirmText={confirmationState.confirmText}
        cancelText={confirmationState.cancelText}
        variant={confirmationState.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    ),
    [confirmationState, handleConfirm, handleCancel]
  );
  return { confirm, Confirmation };
};
