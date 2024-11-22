'use client';
import React from 'react';
import {projectDictionary} from '../utils/projectDictionary'

const DashboardTopBar = ({ 
  logFilter, 
  selectedProject, 
  onLogFilterChange,
  onProjectChange,
  isLoading
}) => {
  const projects = [
    'all',
    'piyush',
    'sneha',
    'aditya',
    'dhananjay',
    'sejal',
    'malvika',
    'sanchari',
    'akarsh',
    'roshini'
  ];

  const logTypes = [
    { value: 'all', label: 'All Logs' },
    { value: 'error', label: 'Error Logs' },
    { value: 'error-free', label: 'Success Logs' },
    { value: '200', label: '200' },
    { value: '400', label: '400' },
    { value: '500', label: '500' }
  ];

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-4">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Project Selection */}
        <select
          value={selectedProject}
          onChange={(e) => onProjectChange(e.target.value)}
          className="bg-gray-700 text-white px-4 py-2 rounded"
          disabled={isLoading}
        >
          {projects.map(project => (
            <option key={project} value={project}>
              {projectDictionary[project].charAt(0).toUpperCase() + projectDictionary[project].slice(1)}
            </option>
          ))}
        </select>

        {/* Log Type Filter */}
        <div className="flex gap-2">
          {logTypes.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onLogFilterChange(value)}
              disabled={isLoading}
              className={`px-4 py-2 rounded transition-all duration-300 ${
                logFilter === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardTopBar; 