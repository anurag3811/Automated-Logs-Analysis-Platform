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

export const getCollectionFromProject = (projectName) => {
  return Object.keys(projectDictionary).find(key => projectDictionary[key] === projectName);
};

export const getProjectName = (username) => {
  return projectDictionary[username.toLowerCase()] || username;
};



