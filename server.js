const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { crawl, initializeCrawler, pauseCrawling, resumeCrawling, stopCrawling } = require('./crawl');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));
app.use(express.json());

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle crawl requests
app.post('/api/crawl', async (req, res) => {
  const { url, depth } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const maxDepth = parseInt(depth) || 3;

  try {
    await initializeCrawler(url);
    res.json({ message: 'Crawling started' });
    
    // Start crawling with the specified depth
    crawl(url, maxDepth, (update) => {
      io.emit('crawlUpdate', update);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Handle pause request
app.post('/api/pause', (req, res) => {
  pauseCrawling();
  io.emit('crawlUpdate', { type: 'status', status: 'paused' });
  res.json({ message: 'Crawling paused' });
});

// Handle resume request
app.post('/api/resume', (req, res) => {
  resumeCrawling();
  io.emit('crawlUpdate', { type: 'status', status: 'running' });
  res.json({ message: 'Crawling resumed' });
});

// Handle stop request
app.post('/api/stop', (req, res) => {
  stopCrawling();
  io.emit('crawlUpdate', { type: 'status', status: 'stopped' });
  res.json({ message: 'Crawling stopped' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});