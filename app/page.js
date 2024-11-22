'use client';
import React from 'react';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import { useDataFetching } from './hooks/useDataFetching';
import { useFilters } from './hooks/useFilters';

// Email configuration
const EMAIL_CONFIG = {
  serviceId: process.env.NEXT_PUBLIC_EMAIL_SERVICE_ID,
  templateId: process.env.NEXT_PUBLIC_EMAIL_TEMPLATE_ID,
  publicKey: process.env.NEXT_PUBLIC_EMAIL_PUBLIC_KEY
};

export default function Home() {
  // Use our custom hooks
  const { 
    allLogs, 
    isLoading: isDataLoading, 
    error: dataError 
  } = useDataFetching();

  const {
    filters,
    updateFilters,
    filteredLogs
  } = useFilters(allLogs);

  if (dataError) {
    return <div className="text-red-500">Error loading data: {dataError}</div>;
  }

  return (
    <div className="mx-auto py-4 px-8 bg-gray-900">
      <TopBar 
        filters={filters}
        updateFilters={updateFilters}
        isLoading={isDataLoading}
      />
      <Dashboard 
        logs={filteredLogs}
        filters={filters}
        updateFilters={updateFilters}
        isLoading={isDataLoading}
      />
    </div>
  );
}
