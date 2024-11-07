'use client';
import React, { useEffect, useState, useRef } from 'react';
import CountUp from 'react-countup';

// Define fixed colors for each failure parameter
const failureColors = {
  'temperature': '#FF6384',  // Red
  'status': '#36A2EB',     // Blue
  'vibration': '#FFCE56',    // Yellow
  'humidity': '#4BC0C0',         // Teal
  'power_supply': '#9966FF'         // Purple
};



const PiyushDashboard = ({ logs }) => {
  const [charts, setCharts] = useState({});
  const chartRefs = useRef({});
  const [isChartUpdating, setIsChartUpdating] = useState(false);

  const piyushLogs = logs.filter(log => log.Username === 'Piyush');
  const totalLogs = piyushLogs.length;
  const totalErrorLogs = piyushLogs.filter(log => log.Values && log.Values.iserrorlog === 1).length;

  // Calculate uptime and downtime for each {plant_id, machine_id} pair
  const machineStats = piyushLogs.reduce((acc, log) => {
    if (log.Values && log.Values.plant_id && log.Values.machine_id) {
      const key = `${log.Values.plant_id}-${log.Values.machine_id}`;
      if (!acc[key]) {
        acc[key] = { uptime: 0, downtime: 0, errors: 0 };
      }
      acc[key].uptime += log.Values.uptime || 0;
      acc[key].downtime += log.Values.downtime || 0;
      if (log.Values.iserrorlog === 1) {
        acc[key].errors += 1;
      }
    }
    return acc;
  }, {});

  // Find the most failing machine
  const mostFailingMachine = Object.entries(machineStats).reduce((a, b) => a[1].errors > b[1].errors ? a : b, [null, { errors: 0 }]);

  // Count failures by parameter
  const failuresByParameter = piyushLogs.reduce((acc, log) => {
    if (log.Values && log.Values.iserrorlog === 1 && log.Values.parameter) {
      acc[log.Values.parameter] = (acc[log.Values.parameter] || 0) + 1;
    }
    return acc;
  }, {});

  const updateCharts = async () => {
    if (!charts.Plotly || isChartUpdating) return;

    setIsChartUpdating(true);
    const { Plotly } = charts;

    try {
      // Prepare pie chart data with fixed colors
      const pieData = Object.entries(failuresByParameter).map(([parameter, count]) => ({
        value: count,
        label: parameter,
        color: failureColors[parameter] || '#FF9F40' // Default orange color if parameter not found
      }));

      await Plotly.react(chartRefs.current.pieChart, [{
        values: pieData.map(d => d.value),
        labels: pieData.map(d => d.label),
        type: 'pie',
        marker: { 
          colors: pieData.map(d => d.color)
        }
      }], {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#ffffff' },
        margin: { t: 50, r: 0, l: 50, b: 50 },
        title: 'Failures Distribution by Parameter'
      });
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
  }, [charts.Plotly, failuresByParameter]);

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
          <h3 className="text-xl font-bold mb-2">Error Rate</h3>
          <p className="text-3xl font-bold text-yellow-400">
            {totalLogs > 0 ? ((totalErrorLogs / totalLogs) * 100).toFixed(2) : 0}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Machine Statistics</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs uppercase bg-gray-700">
                <tr>
                  <th className="px-2 py-2">Plant ID</th>
                  <th className="px-2 py-2">Machine ID</th>
                  <th className="px-2 py-2">Uptime(mins)</th>
                  <th className="px-2 py-2">Downtime(mins)</th>
                  <th className="px-2 py-2">Errors</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(machineStats).map(([key, stats]) => {
                  const [plantId, machineId] = key.split('-');
                  return (
                    <tr key={key} className="border-b border-gray-700">
                      <td className="px-4 py-2">{plantId}</td>
                      <td className="px-4 py-2">{machineId}</td>
                      <td className="px-4 py-2">{stats.uptime.toFixed(2)}</td>
                      <td className="px-4 py-2">{stats.downtime.toFixed(2)}</td>
                      <td className="px-4 py-2">{stats.errors}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <div ref={el => chartRefs.current.pieChart = el} style={{width: "100%", height: "400px"}}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Most Failing Machine</h3>
          {mostFailingMachine[0] ? (
            <>
              <p>Plant ID: <span className="font-bold text-green-400">{mostFailingMachine[0].split('-')[0]}</span></p>
              <p>Machine ID: <span className="font-bold text-green-400">{mostFailingMachine[0].split('-')[1]}</span></p>
              <p>Number of Failures: <span className="font-bold text-red-400">{mostFailingMachine[1].errors}</span></p>
            </>
          ) : (
            <p>No machine failures recorded</p>
          )}
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Failures by Parameter</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(failuresByParameter).map(([parameter, count]) => (
              <div key={parameter} className="bg-gray-700 p-2 rounded">
                <p className="font-bold">{parameter}</p>
                <p className="text-red-400">{count} failures</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PiyushDashboard;
