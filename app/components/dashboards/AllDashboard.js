'use client';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { getProjectName, projectDictionary } from '../../utils/projectDictionary';
import CountUp from 'react-countup';



// Updated color palette to match the dark theme
const colorPalette = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'
];

// Get color for a project
function getColorForProject(projectName) {
  if (projectName == getProjectName('piyush')) {
    return '#FF6384';
  }
  if (projectName == getProjectName('sejal')) {
    return '#36A2EB';
  }
  if (projectName == getProjectName('dhananjay')) {
    return '#FFCE56';
  }
  if (projectName == getProjectName('aditya')) {
    return '#4BC0C0';
  }
  if (projectName == getProjectName('sneha')) {
    return '#9966FF';
  } 
  if (projectName == getProjectName('malvika')) {
    return '#FF9F40';
  }
  if (projectName == getProjectName('roshini')) {
    return '#FF6384';
  }
  if (projectName == getProjectName('sanchari')) {
    return '#36A2EB';
  }
  if (projectName == getProjectName('akarsh')) {
    return '#FFCE56';
  }
  if (projectName == getProjectName('aalllogs')) {
    return '#4BC0C0';
  }

}

const AllDashboard = ({ logs, isLiveMode, lastUpdateTime }) => {
  const [charts, setCharts] = useState({});
  const chartRefs = useRef({});
  const [isChartUpdating, setIsChartUpdating] = useState(false);
  const previousFilterRef = useRef(null);

  // Define filterLogs function
  const filterLogs = useMemo(() => {
    if (!logs) return [];
    return logs;
  }, [logs]);

  // Use filtered logs
  const chartData = useMemo(() => {
    if (!filterLogs || filterLogs.length === 0) return null;

    // Process data for pie chart
    const logsByUser = filterLogs.reduce((acc, log) => {
      const projectName = getProjectName(log.Username) || 'Unknown';
      acc[projectName] = (acc[projectName] || 0) + 1;
      return acc;
    }, {});

    const pieData = Object.entries(logsByUser).map(([project, count]) => ({
      value: count,
      label: project,
      color: getColorForProject(project)
    }));

    // Process data for line chart
    const oldestLog = new Date(Math.min(...filterLogs.map(log => new Date(log.Timestamp))));
    const newestLog = new Date(Math.max(...filterLogs.map(log => new Date(log.Timestamp))));

    const lineData = Object.keys(logsByUser).map(project => {
      const projectLogs = filterLogs.filter(log => getProjectName(log.Username) === project);
      const data = projectLogs.reduce((acc, log) => {
        const hour = new Date(log.Timestamp).setMinutes(0, 0, 0);
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {});

      return {
        x: Object.keys(data).map(time => new Date(parseInt(time))),
        y: Object.values(data),
        type: 'scatter',
        mode: 'lines',
        name: project,
        line: { 
          color: getColorForProject(project),
          shape: 'spline',
          smoothing: 0.8
        }
      };
    });

    return { pieData, lineData, timeRange: [oldestLog, newestLog] };
  }, [filterLogs]);

  const updateCharts = async () => {
    if (!charts.Plotly || !chartData || isChartUpdating) return;

    setIsChartUpdating(true);
    const { Plotly } = charts;
    const { pieData, lineData, timeRange } = chartData;

    try {
      await Promise.all([
        Plotly.react(chartRefs.current.pieChart, [{
          values: pieData.map(d => d.value),
          labels: pieData.map(d => d.label),
          type: 'pie',
          marker: { colors: pieData.map(d => d.color) }
        }], {
          ...layout,
          title: 'Logs Distribution by User'
        }),

        Plotly.react(chartRefs.current.lineChart, lineData, {
          ...layout,
          title: 'Logs Over Time by Project',
          xaxis: {
            title: 'Time',
            type: 'date',
            range: timeRange,
            rangeselector: {
              buttons: [
                {count: 1, label: '1h', step: 'hour', stepmode: 'backward'},
                {count: 6, label: '6h', step: 'hour', stepmode: 'backward'},
                {count: 1, label: '1d', step: 'day', stepmode: 'backward'},
                {count: 7, label: '1w', step: 'day', stepmode: 'backward'},
                {step: 'all', label: 'All'}
              ],
              bgcolor: '#374151',
              activecolor: '#000000',
              bordercolor: '#4B5563',
              font: {color: '#ffffff'}
            },
            rangeslider: {visible: true},
            tickformat: '%b %d, %H:%M'
          },
          yaxis: { 
            title: 'Number of Logs',
            fixedrange: false
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
  useEffect(() => {
    if (charts.Plotly && chartData) {
      updateCharts();
    }
  }, [charts.Plotly, chartData]);

  // Live mode updates
  useEffect(() => {
    if (charts.Plotly && isLiveMode) {
      const interval = setInterval(updateCharts, 10000);
      return () => clearInterval(interval);
    }
  }, [isLiveMode, charts.Plotly, chartData]);

  const layout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#ffffff' },
    margin: { t: 50, r: 0, l: 50, b: 50 }
  };

  return (
    <div className="bg-gray-900 text-white p-6 pt-0 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Project Name:</h3>
          <p className="text-3xl font-bold text-white">
            {'All Projects'}
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Total Logs</h3>
          <p className="text-3xl font-bold text-blue-400">
            <CountUp end={filterLogs.length} duration={2} preserveValue={true} />
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Error Logs</h3>
          <p className="text-3xl font-bold text-red-400">
            <CountUp 
              end={filterLogs.filter(log => log.Values && log.Values.iserrorlog === 1).length} 
              duration={2} 
              preserveValue={true} 
            />
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Error Rate</h3>
          <p className="text-3xl font-bold text-yellow-400">
            <CountUp 
              end={((filterLogs.filter(log => log.Values && log.Values.iserrorlog === 1).length / filterLogs.length) * 100).toFixed(2)} 
              duration={2} 
              preserveValue={true} 
              decimals={2} 
              suffix="%" 
            />
          </p>
        </div>
      </div>

      <div>
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <div ref={el => chartRefs.current.pieChart = el} style={{width: "100%", height: "400px"}}></div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <div ref={el => chartRefs.current.lineChart = el} style={{width: "100%", height: "400px"}}></div>
        </div>
      </div>
    </div>
  );
};

export default AllDashboard;