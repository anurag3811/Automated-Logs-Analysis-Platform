'use client';
import React from 'react';
import LogsDisplay from './LogsDisplay';
import Statistics from './Statistics';
import LoadingSpinner from './LoadingSpinner';
import { projectMetadata } from '../utils/projectDictionary';

const DashboardHeader = ({ project, logs }) => {
  const metadata = projectMetadata[project] || projectMetadata.all;
  
  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-4 shadow-lg">
      <div className="flex items-center gap-4">
        <span className="text-3xl">{metadata.icon}</span>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {metadata.title}
          </h1>
          <p className="text-gray-400 text-sm">
            {metadata.description}
          </p>
        </div>
      </div>
      
      {/* Quick Stats Row
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Logs</div>
          <div className="text-xl font-semibold text-white">
            {logs?.length.toLocaleString() || 0}
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Error Rate</div>
          <div className="text-xl font-semibold text-white">
            {`${((logs?.filter(log => log.Values?.iserrorlog === 1).length / (logs?.length || 1)) * 100).toFixed(1)}%`}
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Last Updated</div>
          <div className="text-xl font-semibold text-white">
            {new Date(Math.max(...(logs?.map(log => new Date(log.Timestamp)) || [Date.now()]))).toLocaleTimeString()}
          </div>
        </div>
      </div> */}
    </div>
  );
};

const Dashboard = ({ logs, filters, isLoading }) => {
  // Guard against undefined logs
  const safeLogs = logs || [];

  return (
    <div className="flex flex-col">
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <DashboardHeader project={filters.project} logs={safeLogs} />
          <div className="flex gap-4 relative">
            <div className="w-1/5 sticky top-4 h-[calc(100vh-280px)]">
              <LogsDisplay logs={safeLogs} />
            </div>
            <div className="w-3/4">
              <Statistics 
                logs={safeLogs}
                collection={filters.project}
                isLiveMode={filters.isLiveMode}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
