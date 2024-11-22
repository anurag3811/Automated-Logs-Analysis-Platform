export const projectDictionary = {
  piyush: "Machine Logs",
  sejal: "Renaming",
  dhananjay: "Jira",
  aditya: "Stock Market",
  sneha: "Hospital",
  malvika: "SCD2",
  roshini: "ChatGPT",
  sanchari: "Taxmaster",
  akarsh: "ADF Replica",
  all: "All Projects"
};

export const projectMetadata = {
  all: {
    title: projectDictionary['all'],
    description: "Comprehensive view of all project logs and analytics across the platform.",
    icon: "📊"
  },
  piyush: {
    title: projectDictionary['piyush'],
    description: "Analytics for authentication and user management services.",
    icon: "🔐"
  },
  sneha: {
    title: projectDictionary['sneha'],
    description: "Monitoring for data processing and ETL pipelines.",
    icon: "🔄"
  },
  aditya: {
    title: projectDictionary['aditya'],
    description: "API gateway and service integration metrics.",
    icon: "🌐"
  },
  dhananjay: {
    title: projectDictionary['dhananjay'],
    description: "Backend infrastructure and database performance tracking.",
    icon: "🏗️"
  },
  sejal: {
    title: projectDictionary['sejal'],
    description: "Frontend application performance and user interactions.",
    icon: "💻"
  },
  malvika: {
    title: projectDictionary['malvika'],
    description: "Security and compliance monitoring system.",
    icon: "🛡️"
  },
  sanchari: {
    title: projectDictionary['sanchari'],
    description: "User experience and session analytics.",
    icon: "👥"
  },
  akarsh: {
    title: projectDictionary['akarsh'],
    description: "System health and performance metrics.",
    icon: "📈"
  },
  roshini: {
    title: projectDictionary['roshini'],
    description: "Error tracking and debugging analytics.",
    icon: "🐛"
  }
};

export const getCollectionFromProject = (projectName) => {
  return Object.keys(projectDictionary).find(key => projectDictionary[key] === projectName);
};

export const getProjectName = (username) => {
  return projectDictionary[username.toLowerCase()] || username;
};



