'use client';
import React, { useState } from 'react';
import LogCard from './LogCard';
import LogModal from './LogModal';
import './LogsDisplay.css';

const LogsDisplay = ({ logs }) => {
  const [selectedLog, setSelectedLog] = useState(null);

  const sortedLogs = logs.sort((a, b) => {
    const convertTimestamp = (logTimestamp) => {
        return logTimestamp.length === 26 ? logTimestamp + "+00:00" : logTimestamp;
    };
    return new Date(convertTimestamp(b.Timestamp)) - new Date(convertTimestamp(a.Timestamp));
  });

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden h-screen">
      <div className="h-full overflow-y-auto p-4 custom-scrollbar">
        <div className="space-y-4">
          {sortedLogs.map((log, index) => (
            <LogCard key={index} log={log} onClick={() => setSelectedLog(log)} />
          ))}
        </div>
      </div>
      <LogModal 
        isOpen={selectedLog !== null}
        onClose={() => setSelectedLog(null)}
        log={selectedLog}
      />
    </div>
  );
};

export default LogsDisplay;
