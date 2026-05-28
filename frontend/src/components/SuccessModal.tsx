import React from 'react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  showReceiptImage?: boolean;
  receiptImageUrl?: string;
  confidence?: number;
  buttonText?: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  showReceiptImage = false,
  receiptImageUrl,
  confidence,
  buttonText = 'OK'
}) => {
  console.log('🔍 DEBUG: SuccessModal props:', {
    isOpen,
    title,
    message,
    showReceiptImage,
    receiptImageUrl,
    confidence,
    buttonText
  });
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
            <span className="text-2xl">✅</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {message}
        </p>

        {showReceiptImage && receiptImageUrl && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="text-sm font-medium text-green-800 dark:text-green-200">
                  Receipt processed successfully!
                </div>
                {confidence && (
                  <div className="text-xs text-green-600 dark:text-green-400">
                    {confidence}% confidence
                  </div>
                )}
              </div>
              <img 
                src={receiptImageUrl} 
                alt="Receipt" 
                className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
              />
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
