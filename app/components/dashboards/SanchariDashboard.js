'use client';
import React, { useEffect, useState, useRef } from 'react';
import CountUp from 'react-countup';

// Define fixed colors for different aspects
const colors = {
  userTypes: {
    'tax advisor': '#FF6384',    // Red
    'user': '#36A2EB',           // Blue
  },
  slots: {
    'morning': '#4BC0C0',        // Teal
    'afternoon': '#FFCE56',      // Yellow
    'evening': '#FF9F40'         // Orange
  },
  ageGroups: {
    'Below 60': '#FF6384',
    '60 to 80': '#36A2EB',
    '80 and above': '#4BC0C0'
  }
};

const SanchariDashboard = ({ logs }) => {
  const [charts, setCharts] = useState({});
  const chartRefs = useRef({});
  const [isChartUpdating, setIsChartUpdating] = useState(false);

  const sanchariLogs = logs.filter(log => log.Username.toLowerCase() === 'sanchari');
  const totalLogs = sanchariLogs.length;
  const totalErrorLogs = sanchariLogs.filter(log => log.Values && log.Values.iserrorlog === 1).length;

  // Process metrics
  const metrics = sanchariLogs.reduce((acc, log) => {
    const values = log.Values || {};
    
    // Track registrations by type
    if (values.message === 'Registration Successful') {
      acc.registrations.total++;
      acc.registrations.byType[values.type] = (acc.registrations.byType[values.type] || 0) + 1;
    }

    // Track calculations
    if (values.message === 'Calculation Successful') {
      acc.calculations.total++;
      acc.calculations.byAge[values.age] = (acc.calculations.byAge[values.age] || 0) + 1;
      acc.calculations.totalIncome += parseFloat(values.income) || 0;
      acc.calculations.totalDeductions += parseFloat(values.deduction) || 0;
      acc.calculations.totalSavings += parseFloat(values.saving) || 0;
    }

    // Track appointments
    if (values.message === 'Appointment Booked') {
      acc.appointments.total++;
      acc.appointments.bySlot[values.slot] = (acc.appointments.bySlot[values.slot] || 0) + 1;
      acc.appointments.byAdvisor[values.id] = (acc.appointments.byAdvisor[values.id] || 0) + 1;
    }

    // Track errors
    if (values.iserrorlog === 1) {
      const category = values.whatfailed || 'unknown';
      acc.errors[category] = acc.errors[category] || {};
      acc.errors[category][values.reason] = (acc.errors[category][values.reason] || 0) + 1;
    }

    return acc;
  }, {
    registrations: {
      total: 0,
      byType: {}
    },
    calculations: {
      total: 0,
      byAge: {},
      totalIncome: 0,
      totalDeductions: 0,
      totalSavings: 0
    },
    appointments: {
      total: 0,
      bySlot: {},
      byAdvisor: {}
    },
    errors: {}
  });

  // Initialize Plotly
  useEffect(() => {
    import('plotly.js-dist').then(plotly => {
      setCharts({ Plotly: plotly.default });
    });
  }, []);

  const updateCharts = async () => {
    if (!charts.Plotly || isChartUpdating) return;
    setIsChartUpdating(true);
    const { Plotly } = charts;

    try {
      // Registration Types Pie Chart
      const regTypeLabels = Object.keys(metrics.registrations.byType);
      const regTypeValues = regTypeLabels.map(type => 
        metrics.registrations.byType[type] || 0
      );

      if (chartRefs.current.regPieChart) {
        await Plotly.newPlot(chartRefs.current.regPieChart, [{
          values: regTypeValues,
          labels: regTypeLabels,
          type: 'pie',
          marker: {
            colors: regTypeLabels.map(type => colors.userTypes[type])
          },
          textinfo: 'label+percent',
          hole: 0.4
        }], {
          title: 'Registration Types Distribution',
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          font: { color: '#ffffff' },
          showlegend: true,
          legend: { font: { color: '#ffffff' } }
        });
      }

      // Age Distribution Bar Chart
      const ageLabels = Object.keys(metrics.calculations.byAge);
      const ageValues = ageLabels.map(age => 
        metrics.calculations.byAge[age] || 0
      );

      if (chartRefs.current.ageBarChart) {
        await Plotly.newPlot(chartRefs.current.ageBarChart, [{
          x: ageLabels,
          y: ageValues,
          type: 'bar',
          marker: {
            color: Object.values(colors.ageGroups)
          }
        }], {
          title: 'Age Distribution',
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          font: { color: '#ffffff' }
        });
      }

      // Appointment Slots Bar Chart
      const slotLabels = Object.keys(metrics.appointments.bySlot);
      const slotValues = slotLabels.map(slot => 
        metrics.appointments.bySlot[slot] || 0
      );

      if (chartRefs.current.slotBarChart) {
        await Plotly.newPlot(chartRefs.current.slotBarChart, [{
          x: slotLabels,
          y: slotValues,
          type: 'bar',
          marker: {
            color: slotLabels.map(slot => colors.slots[slot])
          }
        }], {
          title: 'Appointment Slots Distribution',
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          font: { color: '#ffffff' }
        });
      }

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

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg">
      {/* Standard KPI Section */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Project Name:</h3>
          <p className="text-3xl font-bold text-white">Tax Calculation Portal</p>
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

      {/* Existing KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Total Calculations</h3>
          <p className="text-3xl font-bold text-blue-400">
            <CountUp end={metrics.calculations.total} duration={2} />
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Total Appointments</h3>
          <p className="text-3xl font-bold text-green-400">
            <CountUp end={metrics.appointments.total} duration={2} />
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Total Registrations</h3>
          <p className="text-3xl font-bold text-purple-400">
            <CountUp end={metrics.registrations.total} duration={2} />
          </p>
        </div>


      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <div ref={el => chartRefs.current.regPieChart = el} style={{width: "100%", height: "400px"}}></div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <div ref={el => chartRefs.current.ageBarChart = el} style={{width: "100%", height: "400px"}}></div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <div ref={el => chartRefs.current.slotBarChart = el} style={{width: "100%", height: "400px"}}></div>
        </div>
      </div>

      {/* Tax Calculation Metrics */}
      <h2 className="text-2xl font-bold mb-4">Tax Calculation Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Total Income Processed</h3>
          <p className="text-2xl font-bold text-green-400">
            ₹<CountUp end={metrics.calculations.totalIncome} duration={2} separator="," />
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Total Deductions</h3>
          <p className="text-2xl font-bold text-blue-400">
            ₹<CountUp end={metrics.calculations.totalDeductions} duration={2} separator="," />
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Total Tax Savings</h3>
          <p className="text-2xl font-bold text-yellow-400">
            ₹<CountUp end={metrics.calculations.totalSavings} duration={2} separator="," decimals={2} />
          </p>
        </div>
      </div>

      {/* Appointment Analysis */}
      <h2 className="text-2xl font-bold mb-4">Appointment Analysis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Appointments by Slot</h3>
          <div className="space-y-2">
            {Object.entries(metrics.appointments.bySlot)
              .sort(([,a], [,b]) => b - a)
              .map(([slot, count]) => (
                <div key={slot} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                  <span className="text-sm capitalize">{slot}</span>
                  <span className="text-green-400 font-bold">{count}</span>
                </div>
              ))
            }
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-2">Top Tax Advisors</h3>
          <div className="space-y-2">
            {Object.entries(metrics.appointments.byAdvisor)
              .sort(([,a], [,b]) => b - a)
              .map(([advisor, count]) => (
                <div key={advisor} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                  <span className="text-sm">{advisor}</span>
                  <span className="text-blue-400 font-bold">{count} appointments</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Error Analysis */}
      <h2 className="text-2xl font-bold mb-4 mt-4">Error Analysis</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {Object.entries(metrics.errors).map(([category, reasons]) => (
          <div key={category} className="bg-gray-800 p-4 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-2">{category} Failures</h3>
            <div className="space-y-2">
              {Object.entries(reasons)
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
        ))}
      </div>
    </div>
  );
};

export default SanchariDashboard;
