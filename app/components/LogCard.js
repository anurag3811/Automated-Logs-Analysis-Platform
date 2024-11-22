'use client';
import React from 'react';
import { getProjectName } from '../utils/projectDictionary';

const LogCard = ({ log, onClick }) => {
  const isErrorLog = log.Values && log.Values.iserrorlog === 1;
  const statusCode = log.Values?.statuscode;
  
  const convertTimestamp = (logTimestamp) => {
    return logTimestamp.length === 26 ? logTimestamp + "+00:00" : logTimestamp;
  };

  // Get status code badge color
  const getStatusBadgeColor = (code) => {
    if (!code) return 'bg-green-600'; // Default color for no status code
    
    if (code === 200 || (!isErrorLog && !code)) return 'bg-green-600';
    if (code >= 400 && code < 500) {
      if (code === 401 || code === 403) return 'bg-orange-600';
      return 'bg-orange-600';
    }
    if (code >= 500) return 'bg-red-600';
    return 'bg-gray-600';
  };

  return (
    <div 
      className={`p-4 rounded-lg shadow-md cursor-pointer transition duration-300 ease-in-out relative ${
        isErrorLog ? 'bg-red-900 hover:bg-red-800' : 'bg-gray-700 hover:bg-gray-600'
      }`}
      onClick={onClick}
    >
      {/* Status Code Badge */}
      <div 
        className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold text-white ${
          getStatusBadgeColor(statusCode)
        }`}
      >
        {statusCode || (isErrorLog ? '500' : '200')}
      </div>

      <h3 className="text-lg font-semibold mb-2 text-white pr-16">
        {getProjectName(log.Username)}
      </h3>
      <p className="text-sm text-gray-300 mb-2">
        {new Date(convertTimestamp(log.Timestamp)).toLocaleString()}
      </p>
      {isErrorLog && (
        <div>
          <p className="text-xs font-semibold text-red-300 mb-2">Error Log</p>
          <p className="text-sm text-gray-400 truncate">
            {log.Values && log.Values.Message 
              ? log.Values.Message 
              : log.Values.parameter 
                ? log.Values.parameter 
                : log.Values.reason 
                  ? log.Values.reason 
                  : 'No message available'}
          </p>
        </div>
      )}
    </div>
  );
};

export default LogCard;
