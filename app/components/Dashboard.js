'use client';
import React from 'react';
import LogsDisplay from './LogsDisplay';
import Statistics from './Statistics';
import DashboardTopBar from './DashboardTopBar';
import LoadingSpinner from './LoadingSpinner';

const Dashboard = ({ logs, filters, isLoading, updateFilters }) => {
  // Remove local state since we're using central filters
  const handleLogFilterChange = (newFilter) => {
    updateFilters({ logType: newFilter });
  };

  const handleProjectChange = (newProject) => {
    updateFilters({ project: newProject });
  };

  // Guard against undefined logs
  const safeLogs = logs || [];

  return (
    <div className="flex flex-col">
      <DashboardTopBar 
        logFilter={filters.logType}
        selectedProject={filters.project}
        onLogFilterChange={handleLogFilterChange}
        onProjectChange={handleProjectChange}
        isLoading={isLoading}
      />
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="flex gap-4 mt-4 relative">
          <div className="w-1/5 sticky top-4 h-[calc(100vh-180px)]">
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
      )}
    </div>
  );
};

export default Dashboard;
