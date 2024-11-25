'use client';
import React from 'react';
import LogsDisplay from './LogsDisplay';
import Statistics from './Statistics';
import LoadingSpinner from './LoadingSpinner';
import { projectMetadata } from '../utils/projectDictionary';
import Image from 'next/image';
import '../components/LogsDisplay'

const DashboardHeader = ({ project, logs, filters, updateFilters }) => {
  const metadata = projectMetadata[project] || projectMetadata.all;
  
  const STATUS_CODES = [
    { value: 'all', label: 'All Logs', color: 'blue' },
    { value: 'error', label: 'Error Logs', color: 'red' },
    { value: 'error-free', label: 'Success Logs', color: 'green' },
    { value: '200', label: '200', color: 'green' },
    { value: '400', label: '400', color: 'yellow' },
    { value: '500', label: '500', color: 'red' },
  ];
  
  return (
    <div className="flex flex-col bg-gray-800 rounded-lg px-6 py-4 mb-4 shadow-lg w-full gap-4">
      {/* Top Section */}
      <div className="flex">
        {/* Left half - Project Info */}
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
        
        {/* Right half - KPIs */}
        <div className='w-1/2'>
        <div className="grid grid-cols-3 gap-4 w-full mb-2">
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
        </div>

        <div className="flex justify-start">
        <div className="flex items-center gap-2">
          {STATUS_CODES.map(({ value, label, color }) => (
            <button
              key={value}
              onClick={() => updateFilters({ logType: value })}
              className={`px-3 py-1.5 rounded text-sm transition-all duration-300 ${
                filters.logType === value
                  ? `bg-${color}-600 text-white`
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title={label}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      </div>

      {/* Bottom Section - Status Filters */}
      </div>
    </div>
  );
};

const Dashboard = ({ logs, baseFilteredLogs, filters, updateFilters, isLoading }) => {
  return (
    <div className="flex flex-col h-[1112px] overflow-auto custom-scrollbar">
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <DashboardHeader 
            project={filters.project} 
            logs={baseFilteredLogs} 
            filters={filters}
            updateFilters={updateFilters}
          />
          <div className="flex gap-4 relative">
            <div className="w-1/5 sticky top-4 h-[calc(100vh-280px)]">
              <LogsDisplay logs={logs} />
            </div>
            <div className="w-3/4">
              <Statistics 
                logs={logs}
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
