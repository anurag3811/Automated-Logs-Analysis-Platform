export const projectDictionary = {
  piyush: "DATAFLOW360",
  sejal: "File Upload and Bulk Renaming System ",
  dhananjay: "Mini Jira",
  aditya: "Stock Market",
  sneha: "Hospitalization Status Monitoring System",
  malvika: "SCD Type 2",
  roshini: "SQL Query Generator",
  sanchari: "Taxmaster",
  akarsh: "ADF Replica",
  all: "All Projects"
};

export const projectMetadata = {
  all: {
    title: projectDictionary['all'],
    description: "Comprehensive view of all project logs and analytics across the platform.",
    icon: "/icons/business2.png"
  },
  piyush: {
    title: projectDictionary['piyush'],
    description: "A scalable, secure system for real-time data generation, streaming, storage, analytics, and visualization using FastAPI, React, InfluxDB, Mosquitto, and SQLite.",
    icon: "/icons/analysis.png"
  },
  sneha: {
    title: projectDictionary['sneha'],
    description: "real-time hospitalization status monitoring system that provides a comprehensive dashboard for tracking hospital beds, patient admissions, discharges, and other critical metrics",
    icon: "/icons/hospital.png"
  },
  aditya: {
    title: projectDictionary['aditya'],
    description: "API gateway and service integration metrics.",
    icon: "/icons/business2.png"
  },
  dhananjay: {
    title: projectDictionary['dhananjay'],
    description: "The project provides a web application with timesheet, leave and bug ticket functionalities, alerts, and a dashboard for managers to oversee business metrics and manage team, along with user authentication.",
    icon: "/icons/jira.png"
  },
  sejal: {
    title: projectDictionary['sejal'],
    description: "File management application enables bulk renaming and uploading of files to various storage types, including Local, SharePoint, OneDrive, and ADLS, while providing options for naming rules and logging operations.",
    icon: "/icons/folder-management"
  },
  malvika: {
    title: projectDictionary['malvika'],
    description: "implement scd type 2 using fast api",
    icon: "/icons/data-collection.png"
  },
  sanchari: {
    title: projectDictionary['sanchari'],
    description: "User experience and session analytics.",
    icon: "/icons/business2.png"
  },
  akarsh: {
    title: projectDictionary['akarsh'],
    description: "This project manages file uploads transformations and analysis connecting to multiple database , triggering actions based on events or schedules and incorporating API calls and machine learning regression",
    icon: "/icons/data-warehouse.png"
  },
  roshini: {
    title: projectDictionary['roshini'],
    description: "To help SQL developers create well-structured SQL queries from their input or file uploads, explain SQL queries to provide insights, and correct invalid SQL queries.",
    icon: "/icons/sql-server.png"
  }
};

export const getCollectionFromProject = (projectName) => {
  return Object.keys(projectDictionary).find(key => projectDictionary[key] === projectName);
};

export const getProjectName = (username) => {
  return projectDictionary[username.toLowerCase()] || username;
};



