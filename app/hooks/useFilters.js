import { useState, useMemo } from 'react';
import { applyFilters, applyBaseFilters } from '../services/filterService';

export const useFilters = (logs = []) => {
  const [filters, setFilters] = useState({
    timeWindow: null,
    startDate: '',
    endDate: '',
    project: 'all',
    logType: 'all',
    isLiveMode: true
  });

  // Base filtered logs (only time and project filters)
  const baseFilteredLogs = useMemo(() => {
    return applyBaseFilters(logs, filters);
  }, [logs, filters.timeWindow, filters.startDate, filters.endDate, filters.project, filters.isLiveMode]);

  // Fully filtered logs (including status filters)
  const filteredLogs = useMemo(() => {
    return applyFilters(baseFilteredLogs, filters);
  }, [baseFilteredLogs, filters.logType]);

  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  return {
    filters,
    updateFilters,
    baseFilteredLogs,
    filteredLogs
  };
}; 