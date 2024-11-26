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

// Add this CSS class to your component or global styles
const styles = `
  .dashboard-title {
    position: relative;
    display: inline-block;
    color: #fff;
    font-size: 1.5rem;
    font-weight: 600;
    padding-bottom: 0.5rem;
    letter-spacing: 0.05em;
  }

  .dashboard-title::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
    border-radius: 2px;
  }

  .dashboard-title-container {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .dashboard-title-icon {
    color: #3b82f6;
    opacity: 0.8;
  }
`;

const AllDashboard = ({ logs, isLiveMode, lastUpdateTime }) => {
  const [charts, setCharts] = useState({});
  const chartRefs = useRef({});
  const [isChartUpdating, setIsChartUpdating] = useState(false);
  const previousFilterRef = useRef(null);

  // Initialize Plotly
  useEffect(() => {
    import('plotly.js-dist').then(plotly => {
      setCharts({ Plotly: plotly.default });
    });
  }, []);

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

  // Reset charts when no data is available
  const resetCharts = () => {
    if (!charts.Plotly) return;
    const { Plotly } = charts;

    if (chartRefs.current.pieChart) {
      Plotly.newPlot(chartRefs.current.pieChart, [{
        values: [],
        labels: [],
        type: 'pie'
      }], {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#fff' }
      });
    }

    if (chartRefs.current.lineChart) {
      Plotly.newPlot(chartRefs.current.lineChart, [{
        x: [],
        y: [],
        type: 'scatter',
        mode: 'lines'
      }], {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#fff' }
      });
    }
  };

  const updateCharts = async () => {
    if (!charts.Plotly || isChartUpdating || !logs) return;
    setIsChartUpdating(true);
    const { Plotly } = charts;

    try {
      // Process data for pie chart
      const logsByUser = logs.reduce((acc, log) => {
        const projectName = getProjectName(log.Username) || 'Unknown';
        acc[projectName] = (acc[projectName] || 0) + 1;
        return acc;
      }, {});

      // Create pie chart data
      const pieData = Object.entries(logsByUser).map(([project, count]) => ({
        value: count,
        label: project,
        color: getColorForProject(project)
      }));

      // Update pie chart
      await Plotly.newPlot(chartRefs.current.pieChart, [{
        values: pieData.map(d => d.value),
        labels: pieData.map(d => d.label),
        type: 'pie',
        hole: 0.5,
        marker: {
          colors: pieData.map(d => d.color)
        },
        textinfo: 'percent',
        textposition: 'inside',
        automargin: true,
        showlegend: true,
        hoverinfo: 'label+value+percent',
        hovertemplate: '<b>%{label}</b><br>Logs: %{value}<br>Percentage: %{percent}<extra></extra>',
        textfont: {
          size: 11,
          color: '#ffffff',
          family: 'Arial'
        }
      }], {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { 
          color: '#fff',
          size: 12,
          family: 'Arial'
        },
        showlegend: true,
        legend: { 
          font: { 
            color: '#fff',
            size: 12
          },
          orientation: 'v',
          yanchor: 'middle',
          y: 0.5,
          xanchor: 'left',
          x: 1.1,
          bgcolor: 'rgba(0,0,0,0)',
          bordercolor: 'rgba(255,255,255,0.1)',
          borderwidth: 1
        },
        margin: { 
          t: 40,
          r: 200,
          l: 40,
          b: 40
        },
        annotations: [{
          text: 'Project<br>Distribution',
          showarrow: false,
          font: {
            size: 16,
            color: '#ffffff',
            family: 'Arial'
          },
          x: 0.5,
          y: 0.5
        }]
      });

      // Process line chart data
      const lineData = Object.keys(logsByUser).map(project => {
        const projectLogs = logs.filter(log => getProjectName(log.Username) === project);
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
          line: { color: getColorForProject(project) }
        };
      });

      // Update line chart
      await Plotly.newPlot(chartRefs.current.lineChart, lineData, {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#fff' },
        xaxis: {
          showgrid: true,
          gridcolor: 'rgba(255,255,255,0.1)'
        },
        yaxis: {
          showgrid: true,
          gridcolor: 'rgba(255,255,255,0.1)'
        },
        showlegend: true,
        legend: { font: { color: '#fff' } }
      });

    } catch (error) {
      console.error('Error updating charts:', error);
    } finally {
      setIsChartUpdating(false);
    }
  };

  // Update charts when data changes
  useEffect(() => {
    if (charts.Plotly) {
      updateCharts();
    }
  }, [charts.Plotly, logs]);

  const layout = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#ffffff' },
    margin: { t: 50, r: 0, l: 50, b: 50 }
  };

  // Add safety checks for CountUp values
  const getTotalLogs = () => logs?.length || 0;
  
  const getErrorLogs = () => 
    logs?.filter(log => log.Values && log.Values.iserrorlog === 1)?.length || 0;
  
  const getErrorRate = () => {
    const totalLogs = getTotalLogs();
    const errorLogs = getErrorLogs();
    return totalLogs === 0 ? 0 : ((errorLogs / totalLogs) * 100);
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg">
      <style>{styles}</style>
      {/* Stats Row */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-400 mb-1">Total Logs</h3>
          <p className="text-3xl font-bold text-blue-400">
            <CountUp 
              end={getTotalLogs()} 
              duration={2} 
              preserveValue={true} 
            />
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-400 mb-1">Error Logs</h3>
          <p className="text-3xl font-bold text-red-400">
            <CountUp 
              end={getErrorLogs()} 
              duration={2} 
              preserveValue={true} 
            />
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-400 mb-1">Error Rate</h3>
          <p className="text-3xl font-bold text-yellow-400">
            <CountUp 
              end={getErrorRate()} 
              duration={2} 
              preserveValue={true} 
              decimals={2} 
              suffix="%" 
            />
          </p>
        </div>
      </div> */}

      {/* Charts Grid */}
      <div className="grid grid-row-1 md:grid-row-2 gap-6">
        {/* Project Distribution Chart */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <div className="dashboard-title-container">
            <h2 className="dashboard-title">
              Project Distribution
            </h2>
            <svg 
              className="dashboard-title-icon w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
              />
            </svg>
          </div>
          <div ref={el => chartRefs.current.pieChart = el} 
               className="w-full h-[400px]" />
        </div>

        {/* Activity Timeline */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
          <div className="dashboard-title-container">
            <h2 className="dashboard-title">
              Activity Timeline
            </h2>
            <svg 
              className="dashboard-title-icon w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
          <div ref={el => chartRefs.current.lineChart = el} 
               className="w-full h-[400px]" />
        </div>
      </div>

      {/* Last Update Time
      <div className="mt-4 text-right text-sm text-gray-400">
        Last updated: {new Date(lastUpdateTime).toLocaleString()}
      </div> */}
    </div>
  );
};

export default AllDashboard;