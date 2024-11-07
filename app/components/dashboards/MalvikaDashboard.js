'use client';
import React, { useEffect, useState, useRef } from 'react';
import CountUp from 'react-countup';

// Define fixed colors for different aspects
const colors = {
  scdTypes: {
    'Type 1': '#FF6384',    // Red
    'Type 2': '#36A2EB',    // Blue
  },
  operations: {
    'Initial Load': '#4BC0C0',    // Teal
    'Incremental Load': '#FFCE56', // Yellow
    'Update': '#FF9F40',          // Orange
    'Overwrite': '#9966FF'        // Purple
  }
};

const MalvikaDashboard = ({ logs }) => {
  const [charts, setCharts] = useState({});
  const chartRefs = useRef({});
  const [isChartUpdating, setIsChartUpdating] = useState(false);

  const malvikaLogs = logs.filter(log => log.Username.toLowerCase() === 'malvika');
  const totalLogs = malvikaLogs.length;
  const totalErrorLogs = malvikaLogs.filter(log => log.Values && log.Values.iserrorlog === 1).length;

  // Process data loading metrics
  const loadingMetrics = malvikaLogs.reduce((acc, log) => {
    const values = log.Values || {};
    
    // Count operations by table
    if (values.table) {
      acc.tableOperations[values.table] = (acc.tableOperations[values.table] || 0) + 1;
    }

    // Track SCD types
    if (values.scd_type) {
      acc.scdTypes[values.scd_type] = (acc.scdTypes[values.scd_type] || 0) + 1;
    }

    // Track incremental loads
    if (values.count) {
      acc.totalRecordsLoaded += parseInt(values.count) || 0;
      acc.incrementalLoads++;
    }

    // Track overwrites
    if (values.overwrite === 'Y') {
      acc.overwrites++;
    }

    return acc;
  }, {
    tableOperations: {},
    scdTypes: {},
    totalRecordsLoaded: 0,
    incrementalLoads: 0,
    overwrites: 0
  });

  // Process error metrics
  const errorMetrics = malvikaLogs.reduce((acc, log) => {
    const values = log.Values || {};
    
    if (values.iserrorlog === 1) {
      // Group errors by type
      if (values.whatfailed) {
        acc.errorTypes[values.whatfailed] = (acc.errorTypes[values.whatfailed] || 0) + 1;
      }
      
      // Track error reasons
      if (values.reason) {
        acc.errorReasons[values.reason] = (acc.errorReasons[values.reason] || 0) + 1;
      }

      // Track errors by table
      if (values.table) {
        acc.errorsByTable[values.table] = (acc.errorsByTable[values.table] || 0) + 1;
      }
    }

    return acc;
  }, {
    errorTypes: {},
    errorReasons: {},
    errorsByTable: {}
  });

  const updateCharts = async () => {
    if (!charts.Plotly || isChartUpdating) return;
    setIsChartUpdating(true);
    const { Plotly } = charts;

    try {
      // SCD Types Distribution
      const scdData = [{
        values: Object.values(loadingMetrics.scdTypes),
        labels: Object.keys(loadingMetrics.scdTypes),
        type: 'pie',
        hole: 0.4,
        marker: {
          colors: Object.keys(loadingMetrics.scdTypes).map(type => colors.scdTypes[type])
        }
      }];

      // Operation Messages Distribution
      const messageData = Object.entries(
        malvikaLogs
          .filter(log => log.Values?.message && !log.Values.iserrorlog)
          .reduce((acc, log) => {
            const msg = log.Values.message;
            acc[msg] = (acc[msg] || 0) + 1;
            return acc;
          }, {})
      ).sort(([,a], [,b]) => b - a).slice(0, 5); // Top 5 messages

      const operationBarData = [{
        x: messageData.map(([msg]) => msg),
        y: messageData.map(([, count]) => count),
        type: 'bar',
        marker: {
          color: '#4BC0C0'
        }
      }];

      await Promise.all([
        Plotly.newPlot(chartRefs.current.scdChart, scdData, {
          ...layout,
          title: 'SCD Types Distribution'
        }),
        Plotly.newPlot(chartRefs.current.operationChart, operationBarData, {
          ...layout,
          title: 'Top 5 Operation Types',
          xaxis: { 
            tickangle: -45,
            ticktext: messageData.map(([msg]) => msg.length > 30 ? msg.slice(0, 30) + '...' : msg),
            tickvals: messageData.map((_, i) => i),
          }
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
  }, [charts.Plotly, malvikaLogs]);

  const layout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#ffffff' },
    margin: { t: 50, r: 0, l: 50, b: 50 }
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg">
      {/* Fixed KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Project Name:</h3>
          <p className="text-3xl font-bold text-white">Data Loading System</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Total Logs</h3>
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <div ref={el => chartRefs.current.scdChart = el} style={{width: "100%", height: "300px"}}></div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <div ref={el => chartRefs.current.operationChart = el} style={{width: "100%", height: "300px"}}></div>
        </div>
      </div>

      {/* Loading Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Incremental Loads</h3>
          <p className="text-3xl font-bold text-green-400">
            <CountUp end={loadingMetrics.incrementalLoads} duration={2} preserveValue={true} />
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Table Overwrites</h3>
          <p className="text-3xl font-bold text-yellow-400">
            <CountUp end={loadingMetrics.overwrites} duration={2} preserveValue={true} />
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Table Operations</h3>
          <p className="text-3xl font-bold text-purple-400">
            <CountUp end={Object.keys(loadingMetrics.tableOperations).length} duration={2} preserveValue={true} />
          </p>
        </div>
      </div>

      {/* Operation Analysis - New Section */}
      {/* <h2 className="text-2xl font-bold mb-4 mt-8">Operation Analysis</h2> */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Tables Created</h3>
          <p className="text-3xl font-bold text-blue-400">
            <CountUp 
              end={malvikaLogs.filter(log => 
                log.Values?.message?.includes("Created target table")
              ).length} 
              duration={2} 
            />
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Initial Loads</h3>
          <p className="text-3xl font-bold text-green-400">
            <CountUp 
              end={malvikaLogs.filter(log => 
                log.Values?.message?.includes("Initial load")
              ).length} 
              duration={2} 
            />
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Row Updates</h3>
          <p className="text-3xl font-bold text-yellow-400">
            <CountUp 
              end={malvikaLogs.filter(log => 
                log.Values?.message?.includes("New row inserted")
              ).length} 
              duration={2} 
            />
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Dynamic Columns</h3>
          <p className="text-3xl font-bold text-purple-400">
            <CountUp 
              end={malvikaLogs.filter(log => 
                log.Values?.message?.includes("dynamic column")
              ).length} 
              duration={2} 
            />
          </p>
        </div>
      </div>

      {/* Operation Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Operation Messages</h3>
          <div className="space-y-2 max-h-[500px]">
            {Object.entries(
              malvikaLogs
                .filter(log => log.Values?.message && !log.Values.iserrorlog)
                .reduce((acc, log) => {
                  const msg = log.Values.message;
                  acc[msg] = (acc[msg] || 0) + 1;
                  return acc;
                }, {})
            )
              .sort(([,a], [,b]) => b - a)
              .map(([message, count]) => (
                <div key={message} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                  <span className="text-sm">{message}</span>
                  <span className="text-green-400 font-bold">{count}</span>
                </div>
              ))
            }
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Error Reasons</h3>
          <div className="space-y-2">
            {Object.entries(errorMetrics.errorReasons)
              .sort(([,a], [,b]) => b - a)
              .map(([reason, count]) => (
                <div key={reason} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                  <span className="text-sm">{reason.slice(0, 60)}</span>
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

export default MalvikaDashboard;
