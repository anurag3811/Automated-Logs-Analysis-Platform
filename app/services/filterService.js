// Time window definitions
const TIME_WINDOWS = {
  '1h': 60,
  '6h': 360,
  '12h': 720,
  '24h': 1440,
  '7d': 10080
};

// Time-based filtering
const filterByTimeWindow = (logs, timeWindow) => {
  if (!timeWindow || !logs.length) return [];

  const windowInMinutes = TIME_WINDOWS[timeWindow];
  if (!windowInMinutes) return [];

  const now = new Date();
  const cutoffTime = new Date(now.getTime() - (windowInMinutes * 60 * 1000));
  
  const filteredLogs = logs.filter(log => {
    try {
      return new Date(log.Timestamp) > cutoffTime;
    } catch (e) {
      return false;
    }
  });

  return filteredLogs;
};

const filterByDateRange = (logs, startDate, endDate) => {
  if (!startDate || !endDate || !logs.length) return logs;

  const start = new Date(startDate + 'Z');
  const end = new Date(endDate + 'Z');

  return logs.filter(log => {
    try {
      const logTime = new Date(log.Timestamp);
      return logTime >= start && logTime <= end;
    } catch (e) {
      return false;
    }
  });
};

// Project filtering
const filterByProject = (logs, project) => {
  if (!project || project === 'all') return logs;
  return logs.filter(log => log.Username.toLowerCase() === project.toLowerCase());
};

// Log type filtering
const filterByLogType = (logs, logType) => {
  switch(logType) {
    case 'error':
      return logs.filter(log => log.Values && log.Values.iserrorlog === 1);
    case 'error-free':
      return logs.filter(log => !log.Values || log.Values.iserrorlog !== 1);
      case '200':
        return logs.filter(log => !log.Values || log.Values.iserrorlog !== 1);
        case '400':
      return logs.filter(log => !log.Values || log.Values.statuscode === 400);

      case '500':
      return logs.filter(log => !log.Values || log.Values.statuscode === 500);
    default:
      return logs;
  }
};

// Composite filtering
const applyFilters = (logs, filters) => {
  const {
    timeWindow,
    startDate,
    endDate,
    project,
    logType,
    isLiveMode
  } = filters;

  let filteredLogs = [...logs];

  // Apply time-based filters
  if (isLiveMode && timeWindow) {
    filteredLogs = filterByTimeWindow(filteredLogs, timeWindow);
  } else if (!isLiveMode && startDate && endDate) {
    filteredLogs = filterByDateRange(filteredLogs, startDate, endDate);
  }

  // Apply project filter
  filteredLogs = filterByProject(filteredLogs, project);

  // Apply log type filter
  filteredLogs = filterByLogType(filteredLogs, logType);

  return filteredLogs;
};

export {
  TIME_WINDOWS,
  filterByTimeWindow,
  filterByDateRange,
  filterByProject,
  filterByLogType,
  applyFilters
}; 