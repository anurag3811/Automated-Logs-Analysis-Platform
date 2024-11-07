'use client';
import React, { useEffect, useState, useRef } from 'react';
import CountUp from 'react-countup';

// Define fixed colors for different aspects of the project
const colors = {
  databases: {
    'MySQL': '#FF6384',     // Red
    'PostgreSQL': '#36A2EB', // Blue
    'MSSQL': '#FFCE56'      // Yellow
  },
  actionTypes: {
    'Generate SQL query': '#4BC0C0',    // Teal
    'Explain SQL query': '#9966FF',     // Purple
    'Fix SQL query': '#FF9F40'          // Orange
  },
  errorTypes: {
    'registration': '#FF6384',
    'login': '#36A2EB',
    'file upload': '#FFCE56',
    'response': '#4BC0C0'
  }
};

const RoshiniDashboard = ({ logs }) => {
  const [charts, setCharts] = useState({});
  const chartRefs = useRef({});
  const [isChartUpdating, setIsChartUpdating] = useState(false);

  const roshiniLogs = logs.filter(log => log.Username.toLowerCase() === 'roshini');
  const totalLogs = roshiniLogs.length;
  const totalErrorLogs = roshiniLogs.filter(log => log.Values && log.Values.iserrorlog === 1).length;

  // Calculate additional KPIs
  const totalQueries = roshiniLogs.filter(log => 
    log.Values && log.Values.message === 'query sent'
  ).length;

  const successfulQueries = roshiniLogs.filter(log => 
    log.Values && log.Values.message === 'response recieved successfully'
  ).length;

  const fileUploads = roshiniLogs.filter(log => 
    log.Values && log.Values.message === 'file upload successful'
  ).length;

  // Process logs for different metrics
  const processedData = roshiniLogs.reduce((acc, log) => {
    const values = log.Values || {};
    
    // Count database usage
    if (values.db) {
      acc.databases[values.db] = (acc.databases[values.db] || 0) + 1;
    }

    // Count action types
    if (values.action_type) {
      acc.actionTypes[values.action_type] = (acc.actionTypes[values.action_type] || 0) + 1;
    }

    // Count error types
    if (values.iserrorlog === 1 && values.whatfailed) {
      acc.errorTypes[values.whatfailed] = (acc.errorTypes[values.whatfailed] || 0) + 1;
    }

    return acc;
  }, {
    databases: {},
    actionTypes: {},
    errorTypes: {}
  });

  // Calculate additional metrics
  const registrationMetrics = roshiniLogs.reduce((acc, log) => {
    const values = log.Values || {};
    
    // Count successful registrations
    if (values.message === 'Registration successful') {
      acc.successfulRegistrations++;
    }
    
    // Count OTP sends
    if (values.message === 'otp sent') {
      acc.otpSent++;
    }

    // Track registration failures by reason
    if (values.whatfailed === 'registration') {
      acc.failureReasons[values.reason] = (acc.failureReasons[values.reason] || 0) + 1;
    }

    return acc;
  }, {
    successfulRegistrations: 0,
    otpSent: 0,
    failureReasons: {}
  });

  const loginMetrics = roshiniLogs.reduce((acc, log) => {
    const values = log.Values || {};
    
    if (values.message === 'login successful') {
      acc.successfulLogins++;
    }
    
    if (values.whatfailed === 'login') {
      acc.failedLogins++;
      acc.failureReasons[values.reason] = (acc.failureReasons[values.reason] || 0) + 1;
    }

    return acc;
  }, {
    successfulLogins: 0,
    failedLogins: 0,
    failureReasons: {}
  });

  const updateCharts = async () => {
    if (!charts.Plotly || isChartUpdating) return;

    setIsChartUpdating(true);
    const { Plotly } = charts;

    try {
      // Database Usage Pie Chart
      const dbData = Object.entries(processedData.databases).map(([db, count]) => ({
        value: count,
        label: db,
        color: colors.databases[db]
      }));

      // Action Types Pie Chart
      const actionData = Object.entries(processedData.actionTypes).map(([action, count]) => ({
        value: count,
        label: action,
        color: colors.actionTypes[action]
      }));

      // Error Types Pie Chart
      const errorData = Object.entries(processedData.errorTypes).map(([error, count]) => ({
        value: count,
        label: error,
        color: colors.errorTypes[error]
      }));

      await Promise.all([
        // Database Usage Chart
        Plotly.react(chartRefs.current.dbChart, [{
          values: dbData.map(d => d.value),
          labels: dbData.map(d => d.label),
          type: 'pie',
          marker: { colors: dbData.map(d => d.color) }
        }], {
          ...layout,
          title: 'Database Usage Distribution'
        }),

        // Action Types Chart
        Plotly.react(chartRefs.current.actionChart, [{
          values: actionData.map(d => d.value),
          labels: actionData.map(d => d.label),
          type: 'pie',
          marker: { colors: actionData.map(d => d.color) }
        }], {
          ...layout,
          title: 'Query Action Types Distribution'
        }),

        // Error Types Chart
        Plotly.react(chartRefs.current.errorChart, [{
          values: errorData.map(d => d.value),
          labels: errorData.map(d => d.label),
          type: 'pie',
          marker: { colors: errorData.map(d => d.color) }
        }], {
          ...layout,
          title: 'Error Types Distribution'
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
  }, [charts.Plotly, roshiniLogs]);

  const layout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#ffffff' },
    margin: { t: 50, r: 0, l: 50, b: 50 }
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg">
      {/* Fixed KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Project Name:</h3>
          <p className="text-3xl font-bold text-white">SQL Query Assistant</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <div ref={el => chartRefs.current.dbChart = el} style={{width: "100%", height: "400px"}}></div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <div ref={el => chartRefs.current.actionChart = el} style={{width: "100%", height: "400px"}}></div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <div ref={el => chartRefs.current.errorChart = el} style={{width: "100%", height: "400px"}}></div>
        </div>
      </div>

      {/* Additional KPIs Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Total Queries</h3>
          <p className="text-3xl font-bold text-blue-400">
            <CountUp end={totalQueries} duration={2} preserveValue={true} />
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Query Success Rate</h3>
          <p className="text-3xl font-bold text-green-400">
            <CountUp 
              end={totalQueries > 0 ? (successfulQueries / totalQueries * 100) : 0} 
              duration={2} 
              preserveValue={true}
              decimals={2}
              suffix="%" 
            />
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">File Uploads</h3>
          <p className="text-3xl font-bold text-purple-400">
            <CountUp end={fileUploads} duration={2} preserveValue={true} />
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Most Used DB</h3>
          <p className="text-3xl font-bold text-yellow-400">
            {Object.entries(processedData.databases)
              .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
          </p>
        </div>
      </div>

      {/* Additional Metrics Section */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4">Authentication Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-2">Successful Registrations</h3>
            <p className="text-3xl font-bold text-green-400">
              <CountUp end={registrationMetrics.successfulRegistrations} duration={2} preserveValue={true} />
            </p>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-2">OTP Sent Count</h3>
            <p className="text-3xl font-bold text-blue-400">
              <CountUp end={registrationMetrics.otpSent} duration={2} preserveValue={true} />
            </p>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-2">Login Success Rate</h3>
            <p className="text-3xl font-bold text-yellow-400">
              <CountUp 
                end={loginMetrics.successfulLogins + loginMetrics.failedLogins > 0 ? 
                  (loginMetrics.successfulLogins / (loginMetrics.successfulLogins + loginMetrics.failedLogins) * 100) : 0} 
                duration={2} 
                preserveValue={true}
                decimals={2}
                suffix="%" 
              />
            </p>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-2">Total Login Attempts</h3>
            <p className="text-3xl font-bold text-purple-400">
              <CountUp end={loginMetrics.successfulLogins + loginMetrics.failedLogins} duration={2} preserveValue={true} />
            </p>
          </div>
        </div>

        {/* Common Error Reasons */}
        <h2 className="text-2xl font-bold mb-4">Common Error Reasons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-2">Registration Failures</h3>
            <div className="space-y-2">
              {Object.entries(registrationMetrics.failureReasons)
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

          <div className="bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-2">Login Failures</h3>
            <div className="space-y-2">
              {Object.entries(loginMetrics.failureReasons)
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
    </div>
  );
};

export default RoshiniDashboard;
