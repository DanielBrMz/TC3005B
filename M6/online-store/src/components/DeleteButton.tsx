import { useConfirmation } from "../hooks/useConfirmation";
import { useCallback } from "react";

export const DeleteButton = ({ 
    onDelete, 
    className = "" 
}: { 
    onDelete: () => void;
    className?: string;
}) => {
    const { confirm, Confirmation } = useConfirmation();
    
    const handleDelete = useCallback(async () => {
        try {
            await onDelete();
            // Optional: Show success message
        } catch (error) {
            console.error("Delete failed:", error);
            // Optional: Show error message
        }
    }, [onDelete]);
    
    const showConfirmation = useCallback(() => {
        confirm({
            title: "Confirm Deletion",
            message: "Are you sure you want to delete this item?",
            confirmText: "Delete",
            variant: "danger",
            onConfirm: handleDelete,
        });
    }, [confirm, handleDelete]);
    
    return (
        <>
            <button 
                className={`delete-button ${className}`.trim()} 
                onClick={showConfirmation}
            >
                Delete
            </button>
            <Confirmation />
        </>
    );
};
