import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getIconAndColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: '⚠️',
          iconBg: 'bg-red-100/60 dark:bg-red-900/30 backdrop-blur-sm border border-red-200/60 dark:border-red-700/50',
          iconColor: 'text-red-600',
          buttonBg: 'bg-red-600/80 hover:bg-red-700/90 backdrop-blur-sm border border-red-500/40'
        };
      case 'warning':
        return {
          icon: '⚠️',
          iconBg: 'bg-yellow-100/60 dark:bg-yellow-900/30 backdrop-blur-sm border border-yellow-200/60 dark:border-yellow-700/50',
          iconColor: 'text-yellow-600',
          buttonBg: 'bg-yellow-600/80 hover:bg-yellow-700/90 backdrop-blur-sm border border-yellow-500/40'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          iconBg: 'bg-blue-100/60 dark:bg-blue-900/30 backdrop-blur-sm border border-blue-200/60 dark:border-blue-700/50',
          iconColor: 'text-blue-600',
          buttonBg: 'bg-blue-600/80 hover:bg-blue-700/90 backdrop-blur-sm border border-blue-500/40'
        };
      default:
        return {
          icon: '⚠️',
          iconBg: 'bg-red-100/60 dark:bg-red-900/30 backdrop-blur-sm border border-red-200/60 dark:border-red-700/50',
          iconColor: 'text-red-600',
          buttonBg: 'bg-red-600/80 hover:bg-red-700/90 backdrop-blur-sm border border-red-500/40'
        };
    }
  };

  const { icon, iconBg, buttonBg } = getIconAndColors();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/50 dark:bg-gray-700/40 backdrop-blur-md border border-white/40 dark:border-gray-600/30 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <div className={`w-12 h-12 ${iconBg} rounded-full flex items-center justify-center mr-4`}>
            <span className="text-2xl">{icon}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {message}
        </p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white/30 dark:bg-gray-700/40 backdrop-blur-sm border border-white/40 dark:border-gray-600/30 rounded-lg hover:bg-white/50 dark:hover:bg-gray-600/40 transition-colors duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-white rounded-lg transition-colors duration-200 ${buttonBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
