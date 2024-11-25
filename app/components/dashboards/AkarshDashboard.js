'use client';
import React, { useEffect, useState, useRef } from 'react';
import CountUp from 'react-countup';

// Define fixed colors for different activities
const colors = {
  activities: {
    'Connection Activity': '#FF6384',    // Red
    'Upload File Activity': '#36A2EB',   // Blue
    'Event Based Activity': '#4BC0C0',   // Teal
    'Tumbling Window Activity': '#FFCE56', // Yellow
    'Format Activity': '#FF9F40',        // Orange
    'Copy Data Activity': '#9966FF',     // Purple
    'API Activity': '#FF99CC',           // Pink
    'ML Regression Activity': '#99FF99'  // Light Green
  }
};

const AkarshDashboard = ({ logs }) => {
  const [charts, setCharts] = useState({});
  const chartRefs = useRef({});
  const [isChartUpdating, setIsChartUpdating] = useState(false);

  const akarshLogs = logs.filter(log => log.Username.toLowerCase() === 'akarsh');
  const totalLogs = akarshLogs.length;
  const totalErrorLogs = akarshLogs.filter(log => log.Values && log.Values.iserrorlog === 1).length;

  // Process activity metrics
  const activityMetrics = akarshLogs.reduce((acc, log) => {
    const values = log.Values || {};
    
    if (values.Label) {
      // Count by activity type
      acc.activityTypes[values.Label] = (acc.activityTypes[values.Label] || 0) + 1;

      // Track success/failure by activity
      if (values.iserrorlog === 1) {
        acc.errorsByActivity[values.Label] = (acc.errorsByActivity[values.Label] || 0) + 1;
      }

      // Track messages by activity
      if (values.Message) {
        if (!acc.messagesByActivity[values.Label]) {
          acc.messagesByActivity[values.Label] = {};
        }
        acc.messagesByActivity[values.Label][values.Message] = 
          (acc.messagesByActivity[values.Label][values.Message] || 0) + 1;
      }
    }

    return acc;
  }, {
    activityTypes: {},
    errorsByActivity: {},
    messagesByActivity: {}
  });

  // Calculate success rates
  const successRates = Object.entries(activityMetrics.activityTypes).reduce((acc, [activity, total]) => {
    const errors = activityMetrics.errorsByActivity[activity] || 0;
    acc[activity] = ((total - errors) / total) * 100;
    return acc;
  }, {});

  const updateCharts = async () => {
    if (!charts.Plotly || isChartUpdating) return;
    setIsChartUpdating(true);
    const { Plotly } = charts;

    try {
      // Activity Distribution Pie Chart
      const activityData = [{
        values: Object.values(activityMetrics.activityTypes),
        labels: Object.keys(activityMetrics.activityTypes),
        type: 'pie',
        hole: 0.4,
        marker: {
          colors: Object.keys(activityMetrics.activityTypes).map(type => colors.activities[type])
        }
      }];

      // Success Rate Bar Chart
      const successRateData = [{
        x: Object.keys(successRates),
        y: Object.values(successRates),
        type: 'bar',
        marker: {
          color: Object.keys(successRates).map(activity => colors.activities[activity])
        }
      }];

      await Promise.all([
        Plotly.newPlot(chartRefs.current.activityPie, activityData, {
          ...layout,
          title: 'Activity Distribution'
        }),
        Plotly.newPlot(chartRefs.current.successBar, successRateData, {
          ...layout,
          title: 'Success Rate by Activity',
          yaxis: { title: 'Success Rate (%)', range: [0, 100] }
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

  useEffect(() => {
    if (charts.Plotly) {
      updateCharts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [charts.Plotly, akarshLogs]);

  const layout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#ffffff' },
    margin: { t: 50, r: 0, l: 50, b: 50 }
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg">
      {/* Fixed KPIs
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Project Name:</h3>
          <p className="text-3xl font-bold text-white">Data Pipeline System</p>
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
      </div> */}

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg">
          <div ref={el => chartRefs.current.activityPie = el} style={{width: "100%", height: "400px"}}></div>
        </div>
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg">
          <div ref={el => chartRefs.current.successBar = el} style={{width: "100%", height: "400px"}}></div>
        </div>
      </div>

      {/* Activity Details */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg">
          <h3 className="text-2xl font-bold mb-6">Activity Status</h3>
          <div className="mt-4 max-h-[600px] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(activityMetrics.activityTypes)
              .sort(([,a], [,b]) => b - a)
              .map(([activity, count]) => {
                const errors = activityMetrics.errorsByActivity[activity] || 0;
                return (
                  <div key={activity} className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg">{activity}</span>
                      <span className="text-green-400 font-bold">{count} runs</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Success: {count - errors}</span>
                      <span>Failures: {errors}</span>
                      <span>Rate: {((count - errors) / count * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Top 10 Error Reasons */}
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg">
          <h3 className="text-2xl font-bold mb-6">Top 10 Error Reasons</h3>
          <div className="mt-4 max-h-[600px] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(
              akarshLogs
                .filter(log => log.Values?.iserrorlog === 1)
                .reduce((acc, log) => {
                  const key = `${log.Values.Label} - ${log.Values.Message}`;
                  acc[key] = (acc[key] || 0) + 1;
                  return acc;
                }, {})
            )
              .sort(([,a], [,b]) => b - a)
              .slice(0, 10)
              .map(([errorKey, count], index) => {
                const [activity, message] = errorKey.split(' - ');
                return (
                  <div key={errorKey} className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <span className="text-sm text-blue-400">{activity}</span>
                        <p className="text-md mt-1">{message}</p>
                      </div>
                      <div className="ml-4 flex items-center">
                        <span className="text-red-400 font-bold text-lg">{count}</span>
                        {/* <span className="text-gray-400 text-sm ml-2">occurrences</span> */}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AkarshDashboard;
