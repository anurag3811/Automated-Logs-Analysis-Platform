'use client';
import React, { useState } from 'react';
import LogsDisplay from './LogsDisplay';
import Statistics from './Statistics';
import DashboardTopBar from './DashboardTopBar';
import LoadingSpinner from './LoadingSpinner';

const Dashboard = ({ allLogs, timeFilters, isLiveMode, isLoading, setIsLoading }) => {
  // State for log filtering and project selection
  const [logFilter, setLogFilter] = useState('all'); // 'all', 'error', 'error-free'
  const [selectedProject, setSelectedProject] = useState('all');

  // Wrapped filter change handlers
  const handleLogFilterChange = (newFilter) => {
    setIsLoading(true); // Use main loading state
    setTimeout(() => {
      setLogFilter(newFilter);
      setIsLoading(false);
    }, 100); // Small delay to ensure UI update
  };

  const handleProjectChange = (newProject) => {
    setIsLoading(true); // Use main loading state
    setTimeout(() => {
      setSelectedProject(newProject);
      setIsLoading(false);
    }, 100); // Small delay to ensure UI update
  };

  // Filter logs based on selected filters
  const getFilteredLogs = () => {
    return allLogs.filter(log => {
      // First filter by project

      if (selectedProject !== 'all' && log.Username.toLowerCase() !== selectedProject) {
        return false;
      }

      // Then filter by log type
      switch(logFilter) {
        case 'error':
          return log.Values && log.Values.iserrorlog === 1;
        case 'error-free':
          return !log.Values || log.Values.iserrorlog !== 1;
        default:
          return true;
      }
    });
  };

  const filteredLogs = getFilteredLogs();

  return (
    <div className="flex flex-col">
      <DashboardTopBar 
        logFilter={logFilter}
        setLogFilter={handleLogFilterChange}
        selectedProject={selectedProject}
        setSelectedProject={handleProjectChange}
      />
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="flex gap-4 mt-4 relative">
          <div className=" w-1/5 sticky top-4 h-[calc(100vh-180px)]">
            <LogsDisplay logs={filteredLogs} />
          </div>
          <div className="w-3/4">
            <Statistics 
              logs={filteredLogs}
              collection={selectedProject}
              isLiveMode={isLiveMode}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
