'use client';
import React, { useState, useEffect, useCallback } from 'react';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import emailjs from '@emailjs/browser';

// Email configuration
const EMAIL_CONFIG = {
  serviceId: process.env.NEXT_PUBLIC_EMAIL_SERVICE_ID,
  templateId: process.env.NEXT_PUBLIC_EMAIL_TEMPLATE_ID,
  publicKey: process.env.NEXT_PUBLIC_EMAIL_PUBLIC_KEY
};

// Email mapping
const EMAIL_MAPPING = {
  'sanchari': 'anurag.singh2@rockwellautomation.com',
  'aditya': 'anurag.singh2@rockwellautomation.com'
};

export default function Home() {
  const [allLogs, setAllLogs] = useState([]);
  const [timeFilters, setTimeFilters] = useState({
    startDate: '',
    endDate: ''
  });
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [alertEngineData, setAlertEngineData] = useState({
    aditya: {
      totalOrders: 0,
      totalValue: 0
    }
  });

  const sendAlert = async (templateParams) => {
    try {
      await emailjs.send(
        EMAIL_CONFIG.serviceId,
        EMAIL_CONFIG.templateId,
        templateParams,
        EMAIL_CONFIG.publicKey
      );
    } catch (error) {
      console.error('Failed to send email alert:', error);
    }
  };

  const processAlerts = useCallback(async (logs, isInitialLoad) => {
    if (isInitialLoad) {
      const newData = logs.reduce((acc, log) => {
        const username = log.Username?.toLowerCase();
        const values = log.Values || {};

        if (username === 'aditya' && values.message?.includes('Order Placed')) {
          acc.aditya.totalOrders++;
          acc.aditya.totalValue += parseFloat(values.value || 0);
        }
        return acc;
      }, {...alertEngineData});

      setAlertEngineData(newData);
      return;
    }

    // Process new logs for alerts
    for (const log of logs) {
      const username = log.Username?.toLowerCase();
      const values = log.Values || {};

      if (username === 'sanchari' && values.message === 'Registration Successful') {
        await sendAlert({
          to_email: EMAIL_MAPPING[username],
          alert_type: 'New Registration',
          details: `New user registered - Type: ${values.type}`,
          timestamp: new Date(log.Timestamp).toLocaleString()
        });
      }

      if (username === 'aditya' && values.message?.includes('Order Placed')) {
        const orderValue = parseFloat(values.value || 0);
        
        // Update metrics first
        const newData = {
          ...alertEngineData,
          aditya: {
            totalOrders: alertEngineData.aditya.totalOrders + 1,
            totalValue: alertEngineData.aditya.totalValue + orderValue
          }
        };
        setAlertEngineData(newData);

        // Send order alert
        await sendAlert({
          to_email: EMAIL_MAPPING[username],
          alert_type: 'New Order',
          details: `New order placed - Value: ₹${orderValue.toLocaleString()}`,
          timestamp: new Date(log.Timestamp).toLocaleString()
        });

        // Check average value
        const avgValue = newData.aditya.totalValue / newData.aditya.totalOrders;
        if (avgValue > 10) {
          await sendAlert({
            to_email: EMAIL_MAPPING[username],
            alert_type: 'High Average Order Value',
            details: `Average order value has crossed ₹10 (Current: ₹${avgValue.toFixed(2)})`,
            timestamp: new Date().toLocaleString()
          });
        }
      }
    }
  }, [alertEngineData]);

  const getServerTime = useCallback(async () => {
    try {
      const response = await fetch('/api/current-time');
      const data = await response.json();
      return new Date(data.currentTime);
    } catch (error) {
      console.error('Error fetching server time:', error);
      return new Date();
    }
  }, []);

  const fetchInitialData = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        collection: 'all'
      });
      const response = await fetch(`/api/logs?${params}`);
      if (!response.ok) throw new Error('Failed to fetch logs');
      const data = await response.json();
      setAllLogs(data);
      await processAlerts(data, true);
      setIsLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  }, [processAlerts]); // Remove timeFilters from dependencies

  const fetchIncrementalData = useCallback(async () => {
    try {
      const currentTime = await getServerTime();
      const startTime = new Date(currentTime.getTime() - 10000);
      
      const params = new URLSearchParams({
        collection: 'all',
        startDate: startTime.toISOString(),
        endDate: currentTime.toISOString()
      });

      const response = await fetch(`/api/logs?${params}`);
      if (!response.ok) throw new Error('Failed to fetch incremental logs');
      const newLogs = await response.json();

      if (newLogs.length > 0) {
        await processAlerts(newLogs, false);
        
        if (isLiveMode) {
          setAllLogs(prevLogs => {
            const combinedLogs = [...newLogs, ...prevLogs];
            const uniqueLogs = Array.from(
              new Map(combinedLogs.map(log => [log._id, log])).values()
            );
            return uniqueLogs.sort((a, b) => 
              new Date(b.Timestamp) - new Date(a.Timestamp)
            );
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, [isLiveMode, getServerTime, processAlerts]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    const intervalId = setInterval(fetchIncrementalData, 10000);
    return () => clearInterval(intervalId);
  }, [fetchIncrementalData]);

  return (
    <div className="mx-auto py-4 px-8 bg-gray-900">
      <TopBar 
        timeFilters={timeFilters}
        setTimeFilters={setTimeFilters}
        isLiveMode={isLiveMode}
        setIsLiveMode={setIsLiveMode}
        setIsLoading={setIsLoading}
      />
      <Dashboard 
        allLogs={allLogs}
        timeFilters={timeFilters}
        isLiveMode={isLiveMode}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
    </div>
  );
}
