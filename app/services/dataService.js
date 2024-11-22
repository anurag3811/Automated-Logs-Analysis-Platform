// Core data fetching functions
const fetchLogs = async (params = {}) => {
  const queryParams = new URLSearchParams({
    collection: 'all',
    ...params
  });

  const response = await fetch(`/api/logs?${queryParams}`);
  if (!response.ok) throw new Error('Failed to fetch logs');
  return response.json();
};

const fetchIncrementalLogs = async (startTime, endTime) => {
  return fetchLogs({
    startDate: startTime.toISOString(),
    endDate: endTime.toISOString()
  });
};

const fetchInitialLogs = async () => {
  return fetchLogs();
};

// Helper function to get time window in minutes
const getTimeWindowInMinutes = (timeWindow) => {
  const timeWindows = {
    '1m': 1,
    '2m': 2,
    '3m': 3,
    '1h': 60,
    '6h': 360,
    '12h': 720,
    '24h': 1440,
    '7d': 10080
  };
  return timeWindows[timeWindow] || null;
};

// Process logs with time window consideration
const processLogs = (logs, timeWindow = null) => {
  if (!logs.length) return [];
  
  let processedLogs = [...logs];
  
  // Apply time window filter if specified
  if (timeWindow) {
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - (getTimeWindowInMinutes(timeWindow) * 60 * 1000));
    
    processedLogs = processedLogs.filter(log => {
      try {
        const logTime = new Date(log.Timestamp);
        return logTime >= cutoffTime;
      } catch (e) {
        console.error('Error processing log timestamp:', e);
        return false;
      }
    });
  }

  // Sort by timestamp
  return processedLogs.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
};

// Merge logs with time window consideration
const mergeLogs = (existingLogs, newLogs, timeWindow = null) => {
  const combinedLogs = [...newLogs, ...existingLogs];
  const uniqueLogs = Array.from(
    new Map(combinedLogs.map(log => [log._id, log])).values()
  );
  return processLogs(uniqueLogs, timeWindow);
};

// Single export statement for all functions
export {
  fetchLogs,
  fetchIncrementalLogs,
  fetchInitialLogs,
  getTimeWindowInMinutes,
  processLogs,
  mergeLogs
}; 