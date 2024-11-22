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
        marker: {
          colors: pieData.map(d => d.color)
        },
        textinfo: 'label+percent'
      }], {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#fff' },
        showlegend: true,
        legend: { font: { color: '#fff' } }
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
            <CountUp 
              end={getTotalLogs()} 
              duration={2} 
              preserveValue={true} 
            />
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Error Logs</h3>
          <p className="text-3xl font-bold text-red-400">
            <CountUp 
              end={getErrorLogs()} 
              duration={2} 
              preserveValue={true} 
            />
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Error Rate</h3>
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