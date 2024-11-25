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
    icon: "/icons/business2.png"
  },
  piyush: {
    title: projectDictionary['piyush'],
    description: "Analytics for authentication and user management services.",
    icon: "/icons/business2.png"
  },
  sneha: {
    title: projectDictionary['sneha'],
    description: "Monitoring for data processing and ETL pipelines.",
    icon: "/icons/business2.png"
  },
  aditya: {
    title: projectDictionary['aditya'],
    description: "API gateway and service integration metrics.",
    icon: "/icons/business2.png"
  },
  dhananjay: {
    title: projectDictionary['dhananjay'],
    description: "Backend infrastructure and database performance tracking.",
    icon: "/icons/business2.png"
  },
  sejal: {
    title: projectDictionary['sejal'],
    description: "Frontend application performance and user interactions.",
    icon: "/icons/business2.png"
  },
  malvika: {
    title: projectDictionary['malvika'],
    description: "Security and compliance monitoring system.",
    icon: "/icons/business2.png"
  },
  sanchari: {
    title: projectDictionary['sanchari'],
    description: "User experience and session analytics.",
    icon: "/icons/business2.png"
  },
  akarsh: {
    title: projectDictionary['akarsh'],
    description: "System health and performance metrics.",
    icon: "/icons/business2.png"
  },
  roshini: {
    title: projectDictionary['roshini'],
    description: "Error tracking and debugging analytics.",
    icon: "/icons/business2.png"
  }
};

export const getCollectionFromProject = (projectName) => {
  return Object.keys(projectDictionary).find(key => projectDictionary[key] === projectName);
};

export const getProjectName = (username) => {
  return projectDictionary[username.toLowerCase()] || username;
};



