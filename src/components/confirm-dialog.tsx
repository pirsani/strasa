import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  message: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  className?: string;
}

const ConfirmDialog = ({
  message,
  isOpen,
  onConfirm,
  onCancel,
  className,
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 pointer-events-auto z-50",
        className
      )}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <p className="mb-4">{message}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            Yes
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
