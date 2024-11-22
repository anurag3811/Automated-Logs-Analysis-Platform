'use client';
import React, { useRef, useState } from 'react';
import { TIME_WINDOWS } from '../services/filterService';
import { projectDictionary } from '../utils/projectDictionary';

const TimeWindowButton = ({ window, active, onClick, disabled }) => (
  <button
    className={`px-3 py-1.5 rounded text-sm transition-all duration-300 ${
      active 
        ? 'bg-blue-600 text-white' 
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    onClick={() => onClick(window)}
    disabled={disabled}
  >
    {window}
  </button>
);

const HISTORICAL_RANGES = {
  'Last Hour': { hours: 1 },
  'Last 6 Hours': { hours: 6 },
  'Last 12 Hours': { hours: 12 },
  'Last 24 Hours': { hours: 24 },
  'Last 7 Days': { days: 7 },
  'Last 30 Days': { days: 30 },
  'Custom Range': null
};

const STATUS_CODES = [
  { value: 'all', label: 'All Logs', color: 'blue' },
  { value: 'error', label: 'Error Logs', color: 'red' },
  { value: 'error-free', label: 'Success Logs', color: 'green' },
  { value: '200', label: '200', color: 'green' },
  { value: '400', label: '400', color: 'yellow' },
  { value: '500', label: '500', color: 'red' },
];

export default function TopBar({ filters, updateFilters, isLoading }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedRange, setSelectedRange] = useState('Custom Range');
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

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

  const handleLiveModeToggle = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    updateFilters({
      isLiveMode: !filters.isLiveMode,
      timeWindow: null,
      startDate: '',
      endDate: ''
    });
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleTimeWindowClick = (window) => {
    if (!filters.isLiveMode || isTransitioning) return;
    setIsTransitioning(true);
    updateFilters({
      timeWindow: filters.timeWindow === window ? null : window
    });
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleRangeSelect = (rangeName) => {
    const range = HISTORICAL_RANGES[rangeName];
    if (!range) {
      setSelectedRange('Custom Range');
      return;
    }

    const endDate = new Date();
    const startDate = new Date();

    if (range.hours) {
      startDate.setHours(startDate.getHours() - range.hours);
    } else if (range.days) {
      startDate.setDate(startDate.getDate() - range.days);
    }

    updateFilters({
      startDate: startDate.toISOString().slice(0, 16),
      endDate: endDate.toISOString().slice(0, 16)
    });

    if (startDateRef.current) startDateRef.current.value = startDate.toISOString().slice(0, 16);
    if (endDateRef.current) endDateRef.current.value = endDate.toISOString().slice(0, 16);
    setSelectedRange(rangeName);
  };

  return (
    <div className="bg-gray-800 p-3 rounded-lg shadow-lg mb-4 flex">
      <div className="flex flex-wrap items-center gap-6">
        {/* Mode Toggle and Project Selection Group */}
        <div className="flex items-center gap-3 min-w-fit">
          <button
            onClick={handleLiveModeToggle}
            disabled={isTransitioning || isLoading}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-all duration-300 ${
              filters.isLiveMode 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {filters.isLiveMode ? 'Live Mode' : 'Historical'}
          </button>

          <select
            value={filters.project}
            onChange={(e) => updateFilters({ project: e.target.value })}
            className="bg-gray-700 text-white px-3 py-1.5 rounded text-sm"
            disabled={isLoading}
          >
            {projects.map(project => (
              <option key={project} value={project}>
                {projectDictionary[project].charAt(0).toUpperCase() + projectDictionary[project].slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-gray-600"></div>

        {/* Time Controls Group */}
        <div className="flex items-center gap-3">
          {filters.isLiveMode ? (
            <div className="flex gap-2">
              {Object.keys(TIME_WINDOWS).map(window => (
                <TimeWindowButton
                  key={window}
                  window={window}
                  active={filters.timeWindow === window}
                  onClick={handleTimeWindowClick}
                  disabled={isTransitioning || isLoading}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <select
                value={selectedRange}
                onChange={(e) => handleRangeSelect(e.target.value)}
                className="bg-gray-700 text-white px-3 py-1.5 rounded text-sm"
              >
                {Object.keys(HISTORICAL_RANGES).map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>

              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  ref={startDateRef}
                  onChange={(e) => {
                    setSelectedRange('Custom Range');
                    updateFilters({ startDate: e.target.value });
                  }}
                  className="bg-gray-700 text-white px-3 py-1.5 rounded text-sm"
                  disabled={isTransitioning || isLoading}
                />
                <input
                  type="datetime-local"
                  ref={endDateRef}
                  onChange={(e) => {
                    setSelectedRange('Custom Range');
                    updateFilters({ endDate: e.target.value });
                  }}
                  className="bg-gray-700 text-white px-3 py-1.5 rounded text-sm"
                  disabled={isTransitioning || isLoading}
                />
              </div>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-gray-600"></div>

        {/* Status Code Filters Group */}
        <div className="flex items-center gap-2">
          {STATUS_CODES.map(({ value, label, color }) => (
            <button
              key={value}
              onClick={() => updateFilters({ logType: value })}
              disabled={isLoading}
              className={`px-3 py-1.5 rounded text-sm transition-all duration-300 ${
                filters.logType === value
                  ? `bg-${color}-600 text-white`
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={label}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

