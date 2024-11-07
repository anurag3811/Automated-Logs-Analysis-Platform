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

  // Filter logs based on all filters (time, project, and log type)
  const getFilteredLogs = () => {
    return allLogs.filter(log => {
      // Time filter
      if (!isLiveMode && timeFilters.startDate && timeFilters.endDate) {
        const logTime = new Date(log.Timestamp);
        const startTime = new Date(timeFilters.startDate + 'Z');
        const endTime = new Date(timeFilters.endDate + 'Z');
        
        if (!(logTime >= startTime && logTime <= endTime)) {
          return false;
        }
      }

      // Project filter
      if (selectedProject !== 'all' && log.Username.toLowerCase() !== selectedProject) {
        return false;
      }

      // Log type filter
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

  // Add loading state for filters
  const handleFilterChange = (callback) => {
    setIsLoading(true);
    setTimeout(() => {
      callback();
      setIsLoading(false);
    }, 100);
  };

  const handleLogFilterChange = (newFilter) => {
    handleFilterChange(() => setLogFilter(newFilter));
  };

  const handleProjectChange = (newProject) => {
    handleFilterChange(() => setSelectedProject(newProject));
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
