'use client';
import React, { useEffect, useState, useRef } from 'react';
import CountUp from 'react-countup';

// Define fixed colors for different aspects of the project
const colors = {
  orderTypes: {
    'LIMIT': '#FF6384',    // Red
    'MARKET': '#36A2EB',   // Blue
    'SL': '#FFCE56',       // Yellow
    'SL-M': '#4BC0C0',     // Teal
  },
  errorTypes: {
    'Registration': '#FF6384',
    'login': '#36A2EB',
    'order': '#FFCE56',
    'calculation': '#4BC0C0'
  }
};

const AdityaDashboard = ({ logs }) => {
  const [charts, setCharts] = useState({});
  const chartRefs = useRef({});
  const [isChartUpdating, setIsChartUpdating] = useState(false);

  const adityaLogs = logs.filter(log => log.Username.toLowerCase() === 'aditya');
  const totalLogs = adityaLogs.length;
  const totalErrorLogs = adityaLogs.filter(log => log.Values && log.Values.iserrorlog === 1).length;

  // Process trading data with proper type conversion
  const tradingMetrics = adityaLogs.reduce((acc, log) => {
    const values = log.Values || {};
    
    if (values.message === "Order Placed Successfully") {
      acc.totalOrders++;
      acc.ordersByType[values.order_type] = (acc.ordersByType[values.order_type] || 0) + 1;
      acc.ordersByStock[values.stock] = (acc.ordersByStock[values.stock] || 0) + 1;
      
      // Convert quantity and price to numbers
      const quantity = parseFloat(values.quantity) || 0;
      const price = parseFloat(values.price) || 0;
      
      acc.totalVolume += quantity;
      acc.totalValue += (quantity * price);
    }

    return acc;
  }, {
    totalOrders: 0,
    ordersByType: {},
    ordersByStock: {},
    totalVolume: 0,
    totalValue: 0
  });

  // Process authentication data
  const authMetrics = adityaLogs.reduce((acc, log) => {
    const values = log.Values || {};
    
    if (values.message === "SignUp Successful") {
      acc.successfulRegistrations++;
    }
    
    if (values.whatfailed === 'login') {
      acc.loginFailures++;
      acc.loginFailureReasons[values.reason] = (acc.loginFailureReasons[values.reason] || 0) + 1;
    }

    if (values.whatfailed === 'Registration') {
      acc.registrationFailures++;
      acc.registrationFailureReasons[values.reason] = (acc.registrationFailureReasons[values.reason] || 0) + 1;
    }

    return acc;
  }, {
    successfulRegistrations: 0,
    loginFailures: 0,
    registrationFailures: 0,
    loginFailureReasons: {},
    registrationFailureReasons: {}
  });

  const updateCharts = async () => {
    if (!charts.Plotly || isChartUpdating) return;
    setIsChartUpdating(true);
    const { Plotly } = charts;

    try {
      // Order Types Pie Chart
      const orderTypeLabels = ['LIMIT', 'MARKET', 'SL', 'SL-M'];
      const orderTypeValues = orderTypeLabels.map(type => 
        tradingMetrics.ordersByType[type] || 0
      );

      const pieData = [{
        values: orderTypeValues,
        labels: orderTypeLabels,
        type: 'pie',
        marker: {
          colors: orderTypeLabels.map(type => colors.orderTypes[type])
        },
        textinfo: 'label+percent',
        hole: 0.4
      }];

      const pieLayout = {
        title: 'Order Types Distribution',
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#ffffff' },
        showlegend: true,
        legend: {
          x: 0,
          y: 1,
          font: { color: '#ffffff' }
        },
        margin: { t: 30, r: 0, l: 0, b: 0 },
        height: 300
      };

      // Top 5 Traded Stocks Bar Chart
      const stocksData = Object.entries(tradingMetrics.ordersByStock)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);

      const barData = [{
        x: stocksData.map(([stock]) => stock),
        y: stocksData.map(([, count]) => count),
        type: 'bar',
        marker: {
          color: '#4BC0C0',
          opacity: 0.8
        },
        text: stocksData.map(([, count]) => count),
        textposition: 'auto',
      }];

      const barLayout = {
        title: 'Top 5 Traded Stocks',
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#ffffff' },
        xaxis: {
          title: 'Stock Symbol',
          tickangle: -45,
          color: '#ffffff'
        },
        yaxis: {
          title: 'Number of Orders',
          color: '#ffffff'
        },
        margin: { t: 30, r: 20, l: 50, b: 100 },
        height: 300,
        bargap: 0.3
      };

      await Plotly.newPlot(chartRefs.current.pieChart, pieData, pieLayout, {
        displayModeBar: false,
        responsive: true
      });

      await Plotly.newPlot(chartRefs.current.barChart, barData, barLayout, {
        displayModeBar: false,
        responsive: true
      });

    } catch (error) {
      console.error('Error updating charts:', error);
    } finally {
      setIsChartUpdating(false);
    }
  };

  // Initialize Plotly and update charts
  useEffect(() => {
    import('plotly.js-dist').then((Plotly) => {
      setCharts({ Plotly: Plotly.default });
    });
  }, []);

  useEffect(() => {
    if (charts.Plotly) {
      updateCharts();
    }
  }, [charts.Plotly, adityaLogs]);

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg">
      {/* Fixed KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Project Name:</h3>
          <p className="text-3xl font-bold text-white">Stock Trading System</p>
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
          <div ref={el => chartRefs.current.pieChart = el} style={{width: "100%", height: "300px"}}></div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <div ref={el => chartRefs.current.barChart = el} style={{width: "100%", height: "300px"}}></div>
        </div>
      </div>

      {/* Trading Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Total Orders</h3>
          <p className="text-3xl font-bold text-blue-400">
            <CountUp end={tradingMetrics.totalOrders} duration={2} preserveValue={true} />
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Total Volume</h3>
          <p className="text-3xl font-bold text-green-400">
            <CountUp 
              end={tradingMetrics.totalVolume} 
              duration={2} 
              preserveValue={true}
              separator="," 
            />
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Total Value</h3>
          <p className="text-3xl font-bold text-yellow-400">
            <CountUp 
              end={tradingMetrics.totalValue} 
              duration={2} 
              preserveValue={true}
              prefix="₹"
              separator="," 
              decimals={2}
            />
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Avg Order Value</h3>
          <p className="text-3xl font-bold text-purple-400">
            <CountUp 
              end={tradingMetrics.totalOrders > 0 ? tradingMetrics.totalValue / tradingMetrics.totalOrders : 0} 
              duration={2} 
              preserveValue={true}
              prefix="₹"
              separator="," 
              decimals={2}
            />
          </p>
        </div>
      </div>

      {/* Error Analysis Section */}
      <h2 className="text-2xl font-bold mb-4">Authentication Error Analysis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Registration Failures */}
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Registration Failures</h3>
          <div className="space-y-2">
            {Object.entries(authMetrics.registrationFailureReasons)
              .sort(([,a], [,b]) => b - a)
              .map(([reason, count]) => (
                <div key={reason} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                  <span className="text-sm">{reason}</span>
                  <span className="text-red-400 font-bold">{count}</span>
                </div>
              ))
            }
          </div>
          <div className="mt-4 text-sm text-gray-400">
            <p>Total Registration Failures: {authMetrics.registrationFailures}</p>
            <p>Success Rate: {
              <CountUp 
                end={authMetrics.successfulRegistrations > 0 
                  ? (authMetrics.successfulRegistrations / (authMetrics.successfulRegistrations + authMetrics.registrationFailures) * 100) 
                  : 0
                } 
                duration={2} 
                decimals={1}
                suffix="%" 
              />
            }</p>
          </div>
        </div>

        {/* Login Failures */}
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Login Failures</h3>
          <div className="space-y-2">
            {Object.entries(authMetrics.loginFailureReasons)
              .sort(([,a], [,b]) => b - a)
              .map(([reason, count]) => (
                <div key={reason} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                  <span className="text-sm">{reason}</span>
                  <span className="text-red-400 font-bold">{count}</span>
                </div>
              ))
            }
          </div>
          <div className="mt-4 text-sm text-gray-400">
            <p>Total Login Failures: {authMetrics.loginFailures}</p>
            <p>Success Rate: {
              <CountUp 
                end={authMetrics.loginFailures > 0 
                  ? ((totalLogs - authMetrics.loginFailures) / totalLogs * 100) 
                  : 100
                } 
                duration={2} 
                decimals={1}
                suffix="%" 
              />
            }</p>
          </div>
        </div>
      </div>

      {/* Trading Analysis section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Most Active Stocks section */}
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Most Active Stocks</h3>
          <div className="space-y-2">
            {Object.entries(tradingMetrics.ordersByStock)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([stock, count]) => (
                <div key={stock} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                  <span className="text-sm">{stock}</span>
                  <span className="text-green-400 font-bold">{count} orders</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdityaDashboard;
