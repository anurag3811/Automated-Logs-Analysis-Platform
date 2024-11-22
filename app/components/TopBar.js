'use client';
import React, { useRef, useState } from 'react';
import { TIME_WINDOWS } from '../services/filterService';

const TimeWindowButton = ({ window, active, onClick, disabled }) => (
  <button
    className={`px-4 py-2 rounded transition-all duration-300 ${
      active 
        ? 'bg-blue-600 text-white transform scale-105' 
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    onClick={() => onClick(window)}
    disabled={disabled}
  >
    {window}
  </button>
);

// Add preset ranges for historical mode
const HISTORICAL_RANGES = {
  'Last Hour': { hours: 1 },
  'Last 6 Hours': { hours: 6 },
  'Last 12 Hours': { hours: 12 },
  'Last 24 Hours': { hours: 24 },
  'Last 7 Days': { days: 7 },
  'Last 30 Days': { days: 30 },
  'Custom Range': null
};

export default function TopBar({ filters, updateFilters, isLoading }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedRange, setSelectedRange] = useState('Custom Range');
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  const handleLiveModeToggle = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    updateFilters({
      isLiveMode: !filters.isLiveMode,
      timeWindow: null,
      startDate: '',
      endDate: ''
    });

    if (startDateRef.current) startDateRef.current.value = '';
    if (endDateRef.current) endDateRef.current.value = '';

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
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Live Mode Toggle */}
        <button
          onClick={handleLiveModeToggle}
          disabled={isTransitioning || isLoading}
          className={`px-4 py-2 rounded-lg transition-all duration-300 ${
            filters.isLiveMode 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {filters.isLiveMode ? 'Live Mode' : 'Historical Mode'}
        </button>

        {/* Time Windows (visible only in live mode) */}
        {filters.isLiveMode && (
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
        )}

        {/* Historical Mode Controls */}
        {!filters.isLiveMode && (
          <div className="flex flex-wrap gap-4">
            <select
              value={selectedRange}
              onChange={(e) => handleRangeSelect(e.target.value)}
              className="bg-gray-700 text-white px-4 py-2 rounded"
            >
              {Object.keys(HISTORICAL_RANGES).map(range => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>

            <div className="flex gap-4">
              <input
                type="datetime-local"
                ref={startDateRef}
                onChange={(e) => {
                  setSelectedRange('Custom Range');
                  updateFilters({ startDate: e.target.value });
                }}
                className="bg-gray-700 text-white px-4 py-2 rounded"
                disabled={isTransitioning || isLoading}
              />
              <input
                type="datetime-local"
                ref={endDateRef}
                onChange={(e) => {
                  setSelectedRange('Custom Range');
                  updateFilters({ endDate: e.target.value });
                }}
                className="bg-gray-700 text-white px-4 py-2 rounded"
                disabled={isTransitioning || isLoading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

