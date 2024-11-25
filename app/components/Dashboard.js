'use client';
import React from 'react';
import LogsDisplay from './LogsDisplay';
import Statistics from './Statistics';
import LoadingSpinner from './LoadingSpinner';
import { projectMetadata } from '../utils/projectDictionary';
import Image from 'next/image';
import '../components/LogsDisplay'

const DashboardHeader = ({ project, logs }) => {
  const metadata = projectMetadata[project] || projectMetadata.all;
  
  return (
    <div className="
    flex
    bg-gray-800 rounded-lg px-6 py-2 mb-4 shadow-lg w-full">
      <div className="flex items-center gap-4 w-1/2">
        <Image
            src={metadata.icon}
            alt={`${metadata.title} icon`}
            width={64}
            height={64}
            className="rounded-lg"
          />
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {metadata.title}
          </h1>
          <p className="text-gray-400 text-sm">
            {metadata.description}
          </p>
        </div>
      </div>
      
      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-4 mt-6 w-1/2">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Total Logs</div>
          <div className="text-xl font-semibold text-blue-400">
            {logs?.length.toLocaleString() || 0}
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Error Logs</div>
          <div className="text-xl font-semibold text-red-400">
            {`${((logs?.filter(log => log.Values?.iserrorlog === 1).length))}`}
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Error Rate</div>
          <div className="text-xl font-semibold text-yellow-400">
            {`${((logs?.filter(log => log.Values?.iserrorlog === 1).length / (logs?.length || 1)) * 100).toFixed(1)}%`}
          </div>
        </div>
        {/* <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Last Updated</div>
          <div className="text-xl font-semibold text-white">
            {new Date(Math.max(...(logs?.map(log => new Date(log.Timestamp)) || [Date.now()]))).toLocaleTimeString()}
          </div>
        </div> */}
      </div>
    </div>
  );
};

const Dashboard = ({ logs, filters, isLoading }) => {
  // Guard against undefined logs
  const safeLogs = logs || [];

  return (
    <div className="flex flex-col h-[1272px] overflow-auto custom-scrollbar">
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
