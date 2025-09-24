// src/components/CategoryModal.tsx
import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string }) => Promise<void>;
    initialData?: { slug?: string; name: string } | null;
    isSubmitting: boolean;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isSubmitting,
}) => {
    const [name, setName] = useState(initialData?.name || '');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
        } else {
            setName('');
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({ name });
        if (!isSubmitting) {
            onClose();
        }
    };

    return (
        <Dialog
            visible={isOpen}
            onHide={onClose}
            className="fixed z-10 inset-0 overflow-y-auto"
        >
            <p className="text-lg font-medium text-gray-900 mb-4">
                {initialData?.slug ? 'Update Category' : 'Add New Category'}
            </p>
            <div className="flex items-center justify-center min-h-[20vh]">
                <Dialog onHide={onClose} className="fixed inset-0 bg-black opacity-30" />

                <div className="bg-white rounded-lg p-6 max-w-md mx-auto z-10 w-full">
                    <Dialog onHide={onClose} className="text-lg font-medium text-gray-900 mb-4">
                        {initialData?.slug ? 'Update Category' : 'Add New Category'}
                    </Dialog>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Category Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {initialData?.slug ? 'Updating...' : 'Creating...'}
                                    </span>
                                ) : initialData?.slug ? (
                                    'Update Category'
                                ) : (
                                    'Create Category'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Dialog>
    );
};
