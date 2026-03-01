import React from "react";

type ConfirmDeleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  loading?: boolean;
};

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-700/70 backdrop-blur-sm z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-lg font-bold mb-0.5">{title}</h2>
        <p className="text-sm text-gray-600 mb-2">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-3 py-1.5 border rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};
