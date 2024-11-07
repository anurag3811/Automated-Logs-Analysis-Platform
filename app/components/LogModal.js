import React from 'react';
import ReactDOM from 'react-dom';

const LogModal = ({ isOpen, onClose, log }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-11/12 h-5/6 max-w-4xl overflow-auto">
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
