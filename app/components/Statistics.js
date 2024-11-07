'use client';
import React from 'react';
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
    <div className="w-full md:w-full pl-4">
      {renderDashboard()}
    </div>
  );
};

export default Statistics;
