'use client';
import React, { useEffect, useState, useRef } from 'react';
import CountUp from 'react-countup';

// Define fixed colors for different aspects of the project
const colors = {
  storageTypes: {
    'OneDrive': '#FF6384',    // Red
    'Sharepoint': '#36A2EB',   // Blue
    'ADLS': '#FFCE56',        // Yellow
    'Local': '#4BC0C0'        // Teal
  },
  fileTypes: {
    'csv': '#FF6384',
    'xlsx': '#36A2EB',
    'xls': '#FFCE56',
    'docx': '#4BC0C0',
    'All Files': '#4BC0C0'
  },
  rules: {
    'Add Prefix': '#FF6384',
    'Add Suffix': '#36A2EB',
    'Insert at Position': '#FFCE56',
    'Add Date': '#4BC0C0',
    'Add Timestamp': '#FF9F40',
    'Change Case': '#9966FF',
    'Add Numbering': '#FF99CC',
    'New Name with Numbering': '#99FF99',
    'Replace Text': '#FF69B4',
    'Apply Regex': '#DDA0DD'
  }
};

const SejalDashboard = ({ logs }) => {
  const [charts, setCharts] = useState({});
  const chartRefs = useRef({});
  const [isChartUpdating, setIsChartUpdating] = useState(false);

  const sejalLogs = logs.filter(log => log.Username.toLowerCase() === 'sejal');
  const totalLogs = sejalLogs.length;
  const totalErrorLogs = sejalLogs.filter(log => log.Values && log.Values.iserrorlog === 1).length;

  // Process metrics
  const metrics = sejalLogs.reduce((acc, log) => {
    const values = log.Values || {};
    
    // Track storage type usage
    if (values.storage_type) {
      acc.storageTypes[values.storage_type] = (acc.storageTypes[values.storage_type] || 0) + 1;
    }

    // Track file types
    if (values.file_type) {
      acc.fileTypes[values.file_type[0] != '.' ? values.file_type : values.file_type.split('.')[1]] = (acc.fileTypes[values.file_type[0] != '.' ? values.file_type : values.file_type.split('.')[1]] || 0) + 1;
    }

    // Track rename rules
    if (values.rule) {
      acc.rules[values.rule.split(':')[0]] = (acc.rules[values.rule.split(':')[0]] || 0) + 1;
    }

    // Track operations
    if (values.message === 'upload') {
      acc.uploads++;
    } else if (values.message === 'bulk_rename') {
      acc.renames++;
      acc.totalFilesRenamed += parseInt(values.count) || 0;
    }

    // Track authentication
    if (values.message === 'auth_success') {
      acc.successfulAuths++;
    } else if (values.message === 'auth_error') {
      acc.failedAuths++;
      acc.authErrors[values.reason] = (acc.authErrors[values.reason] || 0) + 1;
    }

    // Track rename errors
    if (values.message === 'rename_error') {
      acc.renameErrors[values.reason] = (acc.renameErrors[values.reason] || 0) + 1;
    }

    return acc;
  }, {
    storageTypes: {},
    fileTypes: {},
    rules: {},
    uploads: 0,
    renames: 0,
    totalFilesRenamed: 0,
    successfulAuths: 0,
    failedAuths: 0,
    authErrors: {},
    renameErrors: {}
  });

  const updateCharts = async () => {
    if (!charts.Plotly || isChartUpdating) return;
    setIsChartUpdating(true);
    const { Plotly } = charts;

    try {
      // Storage Types Pie Chart
      const storageData = [{
        values: Object.values(metrics.storageTypes),
        labels: Object.keys(metrics.storageTypes),
        type: 'pie',
        hole: 0.4,
        marker: {
          colors: Object.keys(metrics.storageTypes).map(type => colors.storageTypes[type])
        }
      }];

      // File Types Bar Chart
      const fileTypeData = [{
        x: Object.keys(metrics.fileTypes),
        y: Object.values(metrics.fileTypes),
        type: 'bar',
        marker: {
          color: Object.keys(metrics.fileTypes).map(type => colors.fileTypes[type])
        }
      }];

      // Rules Usage Bar Chart
      const rulesData = [{
        x: Object.keys(metrics.rules),
        y: Object.values(metrics.rules),
        type: 'bar',
        marker: {
          color: Object.keys(metrics.rules).map(rule => colors.rules[rule])
        }
      }];

      const layout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#ffffff' },
        margin: { t: 50, r: 0, l: 50, b: 100 }
      };

      await Promise.all([
        Plotly.newPlot(chartRefs.current.storagePie, storageData, {
          ...layout,
          title: 'Storage Types Distribution'
        }),
        Plotly.newPlot(chartRefs.current.fileTypeBar, fileTypeData, {
          ...layout,
          title: 'File Types Distribution',
          xaxis: { tickangle: -45 }
        }),
        Plotly.newPlot(chartRefs.current.rulesBar, rulesData, {
          ...layout,
          title: 'Rename Rules Usage',
          xaxis: { tickangle: -45 }
        })
      ]);
    } catch (error) {
      console.error('Error updating charts:', error);
    } finally {
      setIsChartUpdating(false);
    }
  };

  // Initialize Plotly
  useEffect(() => {
    import('plotly.js-dist').then((Plotly) => {
      setCharts({ Plotly: Plotly.default });
    });
  }, []);

  // Update charts when data changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (charts.Plotly) {
      updateCharts();
    }
  }, [charts.Plotly, sejalLogs]);

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg">
      {/* Fixed KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Project Name:</h3>
          <p className="text-3xl font-bold text-white">File Management System</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Total Operations</h3>
          <p className="text-3xl font-bold text-blue-400">
            <CountUp end={totalLogs} duration={2} preserveValue={true} />
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Error Logs</h3>
          <p className="text-3xl font-bold text-red-400">
            <CountUp end={totalErrorLogs} duration={2} preserveValue={true} />
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Success Rate</h3>
          <p className="text-3xl font-bold text-green-400">
            <CountUp 
              end={totalLogs > 0 ? ((totalLogs - totalErrorLogs) / totalLogs * 100) : 0} 
              duration={2} 
              preserveValue={true}
              decimals={2}
              suffix="%" 
            />
          </p>
        </div>
      </div>

      {/* Operation Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Total Uploads</h3>
          <p className="text-3xl font-bold text-blue-400">
            <CountUp end={metrics.uploads} duration={2} preserveValue={true} />
          </p>
        </div>

        {/* <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Rename Operations</h3>
          <p className="text-3xl font-bold text-purple-400">
            <CountUp end={metrics.renames} duration={2} preserveValue={true} />
          </p>
        </div> */}

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Files Renamed</h3>
          <p className="text-3xl font-bold text-green-400">
            <CountUp end={metrics.totalFilesRenamed} duration={2} preserveValue={true} />
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Auth Success Rate</h3>
          <p className="text-3xl font-bold text-yellow-400">
            <CountUp 
              end={metrics.successfulAuths + metrics.failedAuths > 0 
                ? (metrics.successfulAuths / (metrics.successfulAuths + metrics.failedAuths) * 100) 
                : 0
              } 
              duration={2} 
              preserveValue={true}
              decimals={2}
              suffix="%" 
            />
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <div ref={el => chartRefs.current.storagePie = el} style={{width: "100%", height: "400px"}}></div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <div ref={el => chartRefs.current.fileTypeBar = el} style={{width: "100%", height: "400px"}}></div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <div ref={el => chartRefs.current.rulesBar = el} style={{width: "100%", height: "400px"}}></div>
        </div>
      </div>

      {/* Error Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Authentication Errors */}
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Authentication Errors</h3>
          <div className="space-y-2">
            {Object.entries(metrics.authErrors)
              .sort(([,a], [,b]) => b - a)
              .map(([reason, count]) => (
                <div key={reason} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                  <span className="text-sm">{reason}</span>
                  <span className="text-red-400 font-bold">{count}</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* Rename Operation Errors */}
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Rename Operation Errors</h3>
          <div className="space-y-2">
            {Object.entries(metrics.renameErrors)
              .sort(([,a], [,b]) => b - a)
              .map(([reason, count]) => (
                <div key={reason} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                  <span className="text-sm">{reason}</span>
                  <span className="text-red-400 font-bold">{count}</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default SejalDashboard;
