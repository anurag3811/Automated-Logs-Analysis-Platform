'use client';
import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import AllDashboard from './dashboards/AllDashboard';
import PiyushDashboard from './dashboards/PiyushDashboard';
import RoshiniDashboard from './dashboards/RoshiniDashboard';
import AdityaDashboard from './dashboards/AdityaDashboard';
import MalvikaDashboard from './dashboards/MalvikaDashboard';
import SanchariDashboard from './dashboards/SanchariDashboard';
import AkarshDashboard from './dashboards/AkarshDashboard';
import SejalDashboard from './dashboards/SejalDashboard';
import SnehaDashboard from './dashboards/SnehaDashboard';
import DhananjayDashboard from './dashboards/DhananjayDashboard';
import { getProjectName } from '../utils/projectDictionary';

const Statistics = ({ logs, collection, isLiveMode, lastUpdateTime }) => {
  const statisticsRef = useRef(null);

  const generatePDF = async () => {
    if (!statisticsRef.current) return;

    try {
      // Show loading state
      const button = document.getElementById('download-pdf-button');
      const originalText = button.innerText;
      button.innerText = 'Generating PDF...';
      button.disabled = true;

      const canvas = await html2canvas(statisticsRef.current, {
        scale: 2, // Higher scale for better quality
        logging: false,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add title
      pdf.setFontSize(16);
      pdf.text(`${collection.toUpperCase()} Dashboard Statistics`, 105, 15, { align: 'center' });
      
      // Add timestamp
      pdf.setFontSize(10);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });

      // Add the image
      pdf.addImage(imgData, 'PNG', 0, 30, imgWidth, imgHeight);

      // Save the PDF
      pdf.save(`${collection}-dashboard-stats-${new Date().toISOString().slice(0,10)}.pdf`);

      // Reset button state
      button.innerText = originalText;
      button.disabled = false;
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const renderDashboard = () => {
    switch (collection) {
      case 'all':
        return <AllDashboard logs={logs} isLiveMode={isLiveMode} lastUpdateTime={lastUpdateTime} />;
      case 'piyush':
        return <PiyushDashboard logs={logs} isLiveMode={isLiveMode} lastUpdateTime={lastUpdateTime} />;
      case 'sneha':
        return <SnehaDashboard logs={logs} isLiveMode={isLiveMode} lastUpdateTime={lastUpdateTime} />;
      case 'aditya':
        return <AdityaDashboard logs={logs} isLiveMode={isLiveMode} lastUpdateTime={lastUpdateTime} />;
      case 'dhananjay':
        return <DhananjayDashboard logs={logs} isLiveMode={isLiveMode} lastUpdateTime={lastUpdateTime} />;
      case 'sejal':
        return <SejalDashboard logs={logs} isLiveMode={isLiveMode} lastUpdateTime={lastUpdateTime} />;
      case 'malvika':
        return <MalvikaDashboard logs={logs} isLiveMode={isLiveMode} lastUpdateTime={lastUpdateTime} />;
      case 'sanchari':
        return <SanchariDashboard logs={logs} isLiveMode={isLiveMode} lastUpdateTime={lastUpdateTime} />;
      case 'akarsh':
        return <AkarshDashboard logs={logs} isLiveMode={isLiveMode} lastUpdateTime={lastUpdateTime} />;
      case 'roshini':
        return <RoshiniDashboard logs={logs} isLiveMode={isLiveMode} lastUpdateTime={lastUpdateTime} />;
      default:
        return <div>Select a collection to view statistics</div>;
    }
  };

  return (
    <div className="w-full md:w-full pl-4 flex flex-col">
      <div ref={statisticsRef}>
        {renderDashboard()}
      </div>
      <button
        id="download-pdf-button"
        onClick={generatePDF}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 self-center"
      >
        Download PDF Report
      </button>
    </div>
  );
};

export default Statistics;
