'use client';
import React from 'react';
import { getProjectName } from '../utils/projectDictionary';


const LogCard = ({ log, onClick }) => {
  const isErrorLog = log.Values && log.Values.iserrorlog === 1;
  const convertTimestamp = (logTimestamp) => {
    return logTimestamp.length === 26 ? logTimestamp + "+00:00" : logTimestamp;
  };

  return (
    <div 
      className={`p-4 rounded-lg shadow-md cursor-pointer transition duration-300 ease-in-out ${
        isErrorLog ? 'bg-red-900 hover:bg-red-800' : 'bg-gray-700 hover:bg-gray-600'
      }`}
      onClick={onClick}
    >
      <h3 className="text-lg font-semibold mb-2 text-white">
        {getProjectName(log.Username)}
      </h3>
      <p className="text-sm text-gray-300 mb-2">
        {new Date(convertTimestamp(log.Timestamp)).toLocaleString()}
      </p>
      {isErrorLog && (
        <div>
        <p className="text-xs font-semibold text-red-300 mb-2">Error Log</p>
        <p className="text-sm text-gray-400 truncate">
          {log.Values && log.Values.Message ? log.Values.Message : log.Values.parameter ? log.Values.parameter : log.Values.reason ? log.Values.reason : 'No message available'}
        </p>
      </div>
      )}
    </div>
  );
};

export default LogCard;
