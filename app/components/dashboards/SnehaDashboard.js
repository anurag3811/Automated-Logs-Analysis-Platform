'use client';
import React, { useEffect, useState, useRef } from 'react';
import CountUp from 'react-countup';

// Define fixed colors for different aspects of the project
const colors = {
  departments: {
    'cardiology': '#FF6384',    // Red
    'neurology': '#36A2EB',     // Blue
    'orthopedics': '#FFCE56',   // Yellow
    'pediatrics': '#4BC0C0'     // Teal
  },
  eventTypes: {
    'admission': '#FF9F40',     // Orange
    'discharge': '#9966FF',     // Purple
    'billing': '#FF99CC',       // Pink
    'No_beds': '#FF6384',       // Red
    'No_discharge': '#36A2EB'   // Blue
  }
};

const SnehaDashboard = ({ logs }) => {
  const [charts, setCharts] = useState({});
  const chartRefs = useRef({});
  const [isChartUpdating, setIsChartUpdating] = useState(false);

  const snehaLogs = logs.filter(log => log.Username.toLowerCase() === 'sneha');
  const totalLogs = snehaLogs.length;
  const totalErrorLogs = snehaLogs.filter(log => log.Values && log.Values.iserrorlog === 1).length;

  // Process metrics
  const metrics = snehaLogs.reduce((acc, log) => {
    const values = log.Values || {};
    
    // Track events by department
    if (values.department) {
      acc.departmentEvents[values.department] = acc.departmentEvents[values.department] || {
        admissions: 0,
        discharges: 0,
        billings: 0,
        totalAmount: 0,
        overflows: 0
      };

      if (values.event_type === 'admission') {
        acc.departmentEvents[values.department].admissions++;
        acc.totalAdmissions++;
      } else if (values.event_type === 'discharge') {
        acc.departmentEvents[values.department].discharges++;
        acc.totalDischarges++;
      } else if (values.event_type === 'billing') {
        acc.departmentEvents[values.department].billings++;
        acc.departmentEvents[values.department].totalAmount += values.amount || 0;
        acc.totalBillings++;
        acc.totalRevenue += values.amount || 0;
      } else if (['No_beds', 'No_discharge'].includes(values.event_type)) {
        acc.departmentEvents[values.department].overflows++;
        acc.totalOverflows++;
      }
    }

    return acc;
  }, {
    departmentEvents: {},
    totalAdmissions: 0,
    totalDischarges: 0,
    totalBillings: 0,
    totalRevenue: 0,
    totalOverflows: 0
  });

  const updateCharts = async () => {
    if (!charts.Plotly || isChartUpdating) return;
    setIsChartUpdating(true);
    const { Plotly } = charts;

    try {
      // Department Activity Distribution
      const departments = Object.keys(colors.departments);
      const admissionData = departments.map(dept => 
        metrics.departmentEvents[dept]?.admissions || 0
      );
      const dischargeData = departments.map(dept => 
        metrics.departmentEvents[dept]?.discharges || 0
      );
      const billingData = departments.map(dept => 
        metrics.departmentEvents[dept]?.billings || 0
      );

      const activityData = [{
        x: departments,
        y: admissionData,
        name: 'Admissions',
        type: 'bar',
        marker: { color: colors.eventTypes.admission }
      }, {
        x: departments,
        y: dischargeData,
        name: 'Discharges',
        type: 'bar',
        marker: { color: colors.eventTypes.discharge }
      }, {
        x: departments,
        y: billingData,
        name: 'Billings',
        type: 'bar',
        marker: { color: colors.eventTypes.billing }
      }];

      const activityLayout = {
        // title: 'Department Activity Distribution',
        barmode: 'group',
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#ffffff' },
        xaxis: { 
          title: 'Department',
          tickangle: -45,
          color: '#ffffff'
        },
        yaxis: { 
          title: 'Count',
          color: '#ffffff'
        },
        showlegend: true,
        legend: {
          x: 0,
          y: 1.2,
          orientation: 'h',
          font: { color: '#ffffff' }
        },
        margin: { t: 30, r: 20, l: 50, b: 100 },
        height: 400
      };

      // Revenue Distribution Pie Chart
      const revenueData = [{
        values: departments.map(dept => 
          metrics.departmentEvents[dept]?.totalAmount || 0
        ),
        labels: departments,
        type: 'pie',
        hole: 0.4,
        marker: {
          colors: departments.map(dept => colors.departments[dept])
        },
        textinfo: 'label+percent',
      }];

      const revenueLayout = {
        title: 'Revenue Distribution by Department',
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
        height: 400
      };

      await Plotly.newPlot(chartRefs.current.activityChart, activityData, activityLayout, {
        displayModeBar: false,
        responsive: true
      });

      await Plotly.newPlot(chartRefs.current.revenueChart, revenueData, revenueLayout, {
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
// eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [charts.Plotly, snehaLogs]);

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg">
      {/* Fixed KPIs */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Project Name:</h3>
          <p className="text-3xl font-bold text-white">Hospital Management System</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Total Events</h3>
          <p className="text-3xl font-bold text-blue-400">
            <CountUp end={totalLogs} duration={2} preserveValue={true} />
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Error Events</h3>
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

      {/* Event Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Admissions</h3>
          <p className="text-3xl font-bold text-orange-400">
            <CountUp end={metrics.totalAdmissions} duration={2} preserveValue={true} />
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Discharges</h3>
          <p className="text-3xl font-bold text-purple-400">
            <CountUp end={metrics.totalDischarges} duration={2} preserveValue={true} />
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Billings</h3>
          <p className="text-3xl font-bold text-pink-400">
            <CountUp end={metrics.totalBillings} duration={2} preserveValue={true} />
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-400">
            <CountUp 
              end={metrics.totalRevenue} 
              duration={2} 
              preserveValue={true}
              prefix="₹"
              separator="," 
              decimals={2}
            />
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Overflows</h3>
          <p className="text-3xl font-bold text-red-400">
            <CountUp end={metrics.totalOverflows} duration={2} preserveValue={true} />
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <div ref={el => chartRefs.current.activityChart = el} style={{width: "100%", height: "400px"}}></div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <div ref={el => chartRefs.current.revenueChart = el} style={{width: "100%", height: "400px"}}></div>
        </div>
      </div>

      {/* Department Analysis */}
      <h2 className="text-2xl font-bold mb-4">Department Analysis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(metrics.departmentEvents).map(([dept, data]) => (
          <div key={dept} className="bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-2 capitalize">{dept}</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Admissions:</span>
                <span className="text-orange-400 font-bold">{data.admissions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Discharges:</span>
                <span className="text-purple-400 font-bold">{data.discharges}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Billings:</span>
                <span className="text-pink-400 font-bold">{data.billings}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Revenue:</span>
                <span className="text-green-400 font-bold">
                  ₹{data.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Overflows:</span>
                <span className="text-red-400 font-bold">{data.overflows}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SnehaDashboard;
