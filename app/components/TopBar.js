'use client';
import React, { useRef, useState } from 'react';
/* eslint-disable react/display-name */
export default function TopBar({ timeFilters, setTimeFilters, isLiveMode, setIsLiveMode, setIsLoading }){
  const [activeRange, setActiveRange] = useState(null);
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  // Clear filters when switching to live mode
  const handleLiveModeToggle = () => {
    if (!isLiveMode) {
      // Switching to live mode - clear everything
      setActiveRange(null);
      setTimeFilters({
        startDate: '',
        endDate: ''
      });
      if (startDateRef.current) startDateRef.current.value = '';
      if (endDateRef.current) endDateRef.current.value = '';
    }
    setIsLiveMode(!isLiveMode);
  };

  const handleTimeFilterChange = (callback) => {
    setIsLoading(true);
    setTimeout(() => {
      callback();
      setIsLoading(false);
    }, 100);
  };

  const handleQuickSelect = (range) => {
    if (isLiveMode) return;
    
    handleTimeFilterChange(() => {
      setActiveRange(range);
      const end = new Date();
      let start = new Date();
      
      switch(range) {
        case '1h': start.setHours(end.getHours() - 1); break;
        case '6h': start.setHours(end.getHours() - 6); break;
        case '24h': start.setHours(end.getHours() - 24); break;
        case '7d': start.setDate(end.getDate() - 7); break;
      }
      
      const newTimeFilters = {
        startDate: start.toISOString().slice(0, 16),
        endDate: end.toISOString().slice(0, 16)
      };
      
      setTimeFilters(newTimeFilters);
      if (startDateRef.current) startDateRef.current.value = newTimeFilters.startDate;
      if (endDateRef.current) endDateRef.current.value = newTimeFilters.endDate;
    });
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-6">
      {/* Live Mode Toggle */}
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-xl font-bold text-white">Log Analysis Dashboard</h2>
        <button
          onClick={handleLiveModeToggle}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isLiveMode 
            ? 'bg-green-500 hover:bg-green-600 text-white' 
            : 'bg-gray-600 hover:bg-gray-700 text-white'
          }`}
        >
          {isLiveMode ? 'Live Updates On' : 'Live Updates Off'}
        </button>
      </div>

      {/* Date Range Controls - Disabled in live mode */}
      <div className={`space-y-4 ${isLiveMode ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Quick Select Buttons */}
        <div className="flex flex-wrap gap-2">
          {['1h', '6h', '24h', '7d'].map(range => (
            <QuickSelectButton 
              key={range}
              onClick={() => handleQuickSelect(range)}
              isActive={activeRange === range}
              disabled={isLiveMode}
            >
              Last {range}
            </QuickSelectButton>
          ))}
        </div>

        {/* Custom Date Range Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateInput
            label="Start Date"
            ref={startDateRef}
            disabled={isLiveMode}
            onChange={(value) => {
              if (isLiveMode) return;
              setActiveRange(null);
              setTimeFilters(prev => ({ ...prev, startDate: value }));
            }}
          />
          <DateInput
            label="End Date"
            ref={endDateRef}
            disabled={isLiveMode}
            onChange={(value) => {
              if (isLiveMode) return;
              setActiveRange(null);
              setTimeFilters(prev => ({ ...prev, endDate: value }));
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Helper Components
const QuickSelectButton = ({ children, onClick, isActive, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
      isActive
        ? 'bg-blue-500 hover:bg-blue-600 text-white'
        : 'bg-gray-700 hover:bg-gray-600 text-white'
    } ${disabled ? 'cursor-not-allowed' : ''}`}
  >
    {children}
  </button>
);

const DateInput = React.forwardRef(({ label, onChange, disabled }, ref) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-400 mb-1">{label}</label>
    <input
      ref={ref}
      type="datetime-local"
      disabled={disabled}
      className={`bg-gray-700 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none
        ${disabled ? 'cursor-not-allowed' : ''}`}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
));

