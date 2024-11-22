import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  fetchInitialLogs, 
  fetchIncrementalLogs, 
  mergeLogs,
  cleanOldLogs 
} from '../services/dataService';

export const useDataFetching = (isLiveMode = true) => {
  const [allLogs, setAllLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastUpdateTime = useRef(new Date());

  // Clean old logs based on time window
  const cleanupOldLogs = useCallback((logs, timeWindow) => {
    if (!timeWindow) return logs;
    
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - (getTimeWindowInMinutes(timeWindow) * 60 * 1000));
    
    return logs.filter(log => {
      try {
        const logTime = new Date(log.Timestamp);
        return logTime >= cutoffTime;
      } catch (e) {
        console.error('Error processing log timestamp:', e);
        return false;
      }
    });
  }, []);

  // Initial data fetch
  const fetchInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchInitialLogs();
      setAllLogs(data);
      lastUpdateTime.current = new Date();
    } catch (err) {
      setError(err.message);
      console.error('Error fetching initial data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Incremental data fetch with cleanup
  const fetchIncrementalData = useCallback(async (timeWindow) => {
    if (!isLiveMode) return;

    try {
      const currentTime = new Date();
      const startTime = lastUpdateTime.current;
      
      const newLogs = await fetchIncrementalLogs(startTime, currentTime);
      
      setAllLogs(prevLogs => {
        // Merge new logs
        const mergedLogs = mergeLogs(prevLogs, newLogs);
        // Clean old logs based on time window
        return timeWindow ? cleanupOldLogs(mergedLogs, timeWindow) : mergedLogs;
      });

      lastUpdateTime.current = currentTime;
    } catch (err) {
      console.error('Error fetching incremental data:', err);
    }
  }, [isLiveMode, cleanupOldLogs]);

  // Initial fetch effect
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Live updates effect with cleanup
  useEffect(() => {
    let intervalId;
    if (isLiveMode) {
      // Immediate first update
      fetchIncrementalData();
      // Set up interval for subsequent updates
      intervalId = setInterval(() => {
        fetchIncrementalData();
      }, 10000); // 10 second intervals
    }
    return () => clearInterval(intervalId);
  }, [isLiveMode, fetchIncrementalData]);

  return {
    allLogs,
    isLoading,
    error,
    refreshData: fetchInitialData,
    lastUpdateTime: lastUpdateTime.current
  };
}; 