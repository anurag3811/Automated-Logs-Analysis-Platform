import React, { useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom';

const LogModal = ({ isOpen, onClose, log }) => {
  const handleClickOutside = useCallback((e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 modal-overlay"
      onClick={handleClickOutside}
    >
      <div className="bg-gray-800 p-6 rounded-lg w-11/12 h-5/6 max-w-4xl overflow-auto relative">
        {/* Close Icon */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>

        <h3 className="text-lg font-bold text-white mb-2">Log Details</h3>
        <pre className="whitespace-pre-wrap text-white overflow-auto h-[calc(100%-100px)]">
          {JSON.stringify(log, null, 2)}
        </pre>
        <button 
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>,
    document.body
  );
};

export default LogModal;
