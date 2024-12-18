'use client';
import React, { useEffect, useState, useRef } from 'react';
import CountUp from 'react-countup';

// Define fixed colors for different aspects of the project
const colors = {
  activities: {
    'timesheet': '#FF6384',    // Red
    'leave': '#36A2EB',        // Blue
    'ticket': '#FFCE56',       // Yellow
    'project': '#4BC0C0'       // Teal
  },
  leaveTypes: {
    '1': '#FF9F40',         // Orange - Sick Leave
    '2': '#9966FF',         // Purple - Casual Leave
    '3': '#FF99CC',         // Pink - Paid Leave
  },
  // Helper function to get leave type name
  getLeaveTypeName: (id) => {
    const leaveTypes = {
      '1': 'Sick Leave',
      '2': 'Casual Leave',
      '3': 'Paid Leave'
    };
    return leaveTypes[id] || `Leave Type ${id}`;
  }
};

const DhananjayDashboard = ({ logs }) => {
  const [charts, setCharts] = useState({});
  const chartRefs = useRef({});
  const [isChartUpdating, setIsChartUpdating] = useState(false);

  const dhananjayLogs = logs.filter(log => log.Username.toLowerCase() === 'dhananjay');
  const totalLogs = dhananjayLogs.length;
  const totalErrorLogs = dhananjayLogs.filter(log => log.Values && log.Values.iserrorlog === 1).length;

  // Process metrics
  const metrics = dhananjayLogs.reduce((acc, log) => {
    const values = log.Values || {};
    
    if (values.activity === 'timesheet') {
      acc.timesheet.total++;
      if (values.type === 'logged') {
        acc.timesheet.logged += parseFloat(values.hours) || 0;
        acc.timesheet.byEmployee[values.emp] = (acc.timesheet.byEmployee[values.emp] || 0) + 
          (parseFloat(values.hours) || 0);
      }
    } 
    else if (values.activity === 'leave') {
      acc.leave.total++;
      if (values.type === 'apply') {
        acc.leave.applied += parseFloat(values.days) || 0;
        acc.leave.byType[values.leave_type] = (acc.leave.byType[values.leave_type] || 0) + 
          (parseFloat(values.days) || 0);
      }
      acc.leave.status[values.type]++;
    }
    else if (values.activity === 'ticket') {
      acc.tickets.total++;
      if (values.type === 'created') {
        acc.tickets.created++;
        acc.tickets.byCreator[values.creator] = (acc.tickets.byCreator[values.creator] || 0) + 1;
      } else if (values.type === 'closed') {
        acc.tickets.closed++;
      }
    }
    else if (values.activity === 'project') {
      acc.projects++;
    }

    return acc;
  }, {
    timesheet: {
      total: 0,
      logged: 0,
      byEmployee: {}
    },
    leave: {
      total: 0,
      applied: 0,
      byType: {},
      status: {
        apply: 0,
        accept: 0,
        reject: 0
      }
    },
    tickets: {
      total: 0,
      created: 0,
      closed: 0,
      byCreator: {}
    },
    projects: 0
  });

  const updateCharts = async () => {
    if (!charts.Plotly || isChartUpdating) return;
    setIsChartUpdating(true);
    const { Plotly } = charts;

    try {
      // Activity Distribution Pie Chart
      const activityData = [{
        values: [
          metrics.timesheet.total,
          metrics.leave.total,
          metrics.tickets.total,
          metrics.projects
        ],
        labels: ['Timesheet', 'Leave', 'Tickets', 'Projects'],
        type: 'pie',
        marker: {
          colors: Object.values(colors.activities)
        },
        hole: 0.4
      }];

      // Leave Types Bar Chart with Legend
      const leaveData = [
        {
          x: ['Leave Types'],
          y: [metrics.leave.byType['1'] || 0],
          name: 'Sick Leave',
          type: 'bar',
          marker: { color: colors.leaveTypes['1'] },
          hovertemplate: 'Sick Leave: %{y} days<extra></extra>'
        },
        {
          x: ['Leave Types'],
          y: [metrics.leave.byType['2'] || 0],
          name: 'Casual Leave',
          type: 'bar',
          marker: { color: colors.leaveTypes['2'] },
          hovertemplate: 'Casual Leave: %{y} days<extra></extra>'
        },
        {
          x: ['Leave Types'],
          y: [metrics.leave.byType['3'] || 0],
          name: 'Paid Leave',
          type: 'bar',
          marker: { color: colors.leaveTypes['3'] },
          hovertemplate: 'Paid Leave: %{y} days<extra></extra>'
        }
      ];

      // Tickets Status
      const ticketData = [{
        values: [metrics.tickets.closed, metrics.tickets.created - metrics.tickets.closed],
        labels: ['Closed', 'Open'],
        type: 'pie',
        marker: {
          colors: ['#4BC0C0', '#FF6384']
        },
        hole: 0.4
      }];

      // Create separate layouts for each chart
      const baseLayout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#ffffff' },
        showlegend: true,
        legend: { 
          font: { color: '#ffffff' },
          orientation: 'h',     // horizontal legend
          yanchor: 'bottom',   // anchor to bottom
          y: -0.3,            // position below chart
          xanchor: 'center',   // center horizontally
          x: 0.5              // center position
        },
        margin: { t: 30, r: 40, l: 40, b: 80 }  // increased bottom margin for legend
      };

      const leaveLayout = {
        ...baseLayout,
        barmode: 'group',  // Group bars side by side
        yaxis: {
          title: 'Number of Days',
          titlefont: { color: '#ffffff' },
          gridcolor: 'rgba(255,255,255,0.1)',
          tickfont: { color: '#ffffff' }
        },
        xaxis: {
          tickfont: { color: '#ffffff' },
          showticklabels: false  // Hide x-axis labels since we have the legend
        },
        legend: {
          font: { color: '#ffffff', size: 12 },
          orientation: 'h',
          yanchor: 'bottom',
          y: -0.3,
          xanchor: 'center',
          x: 0.5,
          bgcolor: 'rgba(0,0,0,0)',
          bordercolor: 'rgba(255,255,255,0.2)',
          borderwidth: 1,
          traceorder: 'normal'
        },
        margin: { t: 30, r: 40, l: 60, b: 80 }
      };

      await Promise.all([
        Plotly.newPlot(chartRefs.current.activityPie, activityData, baseLayout),
        Plotly.newPlot(chartRefs.current.leaveBar, leaveData, leaveLayout),
        Plotly.newPlot(chartRefs.current.ticketPie, ticketData, baseLayout)
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
  }, [charts.Plotly, dhananjayLogs]);

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg">
      {/* Project Info & KPIs
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Project Name:</h3>
          <p className="text-3xl font-bold text-white">HR Management System</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Total Activities</h3>
          <p className="text-3xl font-bold text-blue-400">
            <CountUp end={totalLogs} duration={2} preserveValue={true} />
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Total Hours Logged</h3>
          <p className="text-3xl font-bold text-green-400">
            <CountUp end={metrics.timesheet.logged} duration={2} decimals={1} suffix="h" />
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Leave Approval Rate</h3>
          <p className="text-3xl font-bold text-yellow-400">
            <CountUp 
              end={metrics.leave.status.apply > 0 
                ? (metrics.leave.status.accept / metrics.leave.status.apply * 100) 
                : 0
              } 
              duration={2} 
              decimals={1}
              suffix="%" 
            />
          </p>
        </div>
      </div> */}

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Activity Distribution</h3>
          <div ref={el => chartRefs.current.activityPie = el} style={{width: "100%", height: "400px"}}></div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Leave Types</h3>
          <div ref={el => chartRefs.current.leaveBar = el} style={{width: "100%", height: "400px"}}></div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Ticket Status</h3>
          <div ref={el => chartRefs.current.ticketPie = el} style={{width: "100%", height: "400px"}}></div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Time Loggers */}
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Top Time Loggers</h3>
          <div className="space-y-2">
            {Object.entries(metrics.timesheet.byEmployee)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([emp, hours]) => (
                <div key={emp} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                  <span className="text-sm">{emp}</span>
                  <span className="text-blue-400 font-bold">{hours.toFixed(1)}h</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* Top Ticket Creators */}
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Top Ticket Creators</h3>
          <div className="space-y-2">
            {Object.entries(metrics.tickets.byCreator)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([creator, count]) => (
                <div key={creator} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                  <span className="text-sm">{creator}</span>
                  <span className="text-yellow-400 font-bold">{count} tickets</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default DhananjayDashboard;
