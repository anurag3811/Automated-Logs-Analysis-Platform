import { useState, useMemo } from 'react';
import { applyFilters } from '../services/filterService';

export const useFilters = (logs = []) => {
  const [filters, setFilters] = useState({
    timeWindow: null,
    startDate: '',
    endDate: '',
    project: 'all',
    logType: 'all',
    isLiveMode: true
  });

  // Memoized filtered logs
  const filteredLogs = useMemo(() => {
    return applyFilters(logs, filters);
  }, [logs, filters]);

  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  return {
    filters,
    updateFilters,
    filteredLogs
  };
}; 