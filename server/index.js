const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { MongoClient } = require('mongodb');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const mongoClient = new MongoClient('mongodb://localhost:27017');
let db;

async function connectToMongo() {
  await mongoClient.connect();
  db = mongoClient.db('logDatabase');
  console.log('Connected to MongoDB');
}

connectToMongo();

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  
  ws.on('message', async (message) => {
    const data = JSON.parse(message);
    if (data.type === 'subscribe') {
      ws.collection = data.collection;
      sendInitialData(ws);
    }
  });
});

async function sendInitialData(ws) {
  const logs = await db.collection('logs')
    .find(ws.collection !== 'all' ? { Username: ws.collection } : {})
    .sort({ Timestamp: -1 })
    .limit(1000)
    .toArray();
  
  ws.send(JSON.stringify({ type: 'initial', data: logs }));
}

async function broadcastNewLogs(newLog) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && (client.collection === 'all' || client.collection === newLog.Username)) {
      client.send(JSON.stringify({ type: 'update', data: newLog }));
    }
  });
}

app.get('/api/logs', async (req, res) => {
  const { collection, startDate, endDate } = req.query;
  const query = collection !== 'all' ? { Username: collection } : {};
  if (startDate) query.Timestamp = { $gte: new Date(startDate) };
  if (endDate) query.Timestamp = { ...query.Timestamp, $lte: new Date(endDate) };

  const logs = await db.collection('logs')
    .find(query)
    .sort({ Timestamp: -1 })
    .limit(1000)
    .toArray();

  res.json(logs);
});

// Simulated log ingestion (replace with your actual log ingestion method)
setInterval(async () => {
  const newLog = {
    Username: ['piyush', 'sneha', 'aditya', 'dhananjay', 'sejal', 'malvika', 'sanchari', 'akarsh', 'roshini'][Math.floor(Math.random() * 9)],
    Timestamp: new Date(),
    Message: `Log message ${Math.random()}`,
    Values: { iserrorlog: Math.random() > 0.8 ? 1 : 0 }
  };

  await db.collection('logs').insertOne(newLog);
  broadcastNewLogs(newLog);
}, 1000);

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
