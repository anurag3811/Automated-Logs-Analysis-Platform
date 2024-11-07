'use client';
import React from 'react';
import { projectDictionary } from '../utils/projectDictionary';

const DashboardTopBar = ({ logFilter, setLogFilter, selectedProject, setSelectedProject }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Log Type Filter */}
        <div className="flex items-center space-x-4">
          <span className="text-white font-medium">Log Type:</span>
          <div className="flex space-x-4">
            <RadioButton
              id="all-logs"
              value="all"
              checked={logFilter === 'all'}
              onChange={() => setLogFilter('all')}
              label="All Logs"
            />
            <RadioButton
              id="error-logs"
              value="error"
              checked={logFilter === 'error'}
              onChange={() => setLogFilter('error')}
              label="Error Logs"
            />
            <RadioButton
              id="error-free-logs"
              value="error-free"
              checked={logFilter === 'error-free'}
              onChange={() => setLogFilter('error-free')}
              label="Success Logs"
            />
          </div>
        </div>

        {/* Project Selection Dropdown */}
        <div className="flex items-center space-x-4">
          <span className="text-white font-medium">Project:</span>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Projects</option>
            {Object.entries(projectDictionary).map(([key, value]) => (
              key !== 'all' && (
                <option key={key} value={key}>
                  {value}
                </option>
              )
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

// Helper Component for Radio Buttons
const RadioButton = ({ id, value, checked, onChange, label }) => (
  <label 
    htmlFor={id} 
    className="flex items-center space-x-2 cursor-pointer"
  >
    <input
      type="radio"
      id={id}
      value={value}
      checked={checked}
      onChange={onChange}
      className="form-radio text-blue-500 focus:ring-blue-500 h-4 w-4 cursor-pointer"
    />
    <span className="text-white">{label}</span>
  </label>
);

export default DashboardTopBar; 