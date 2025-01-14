# Web Crawl Hopper 🕷️

A sophisticated web crawler with a real-time interactive dashboard, built using Node.js, Express, and Socket.IO. This project features a modern web interface for controlling and monitoring the crawling process, with support for depth-limited crawling, rate limiting, and intelligent URL parsing.

## Features 🌟

### Core Functionality
- Interactive web dashboard for real-time crawl monitoring
- Depth-limited crawling with configurable maximum depth
- Domain-scoped crawling (stays within the initial domain)
- Robots.txt compliance
- Intelligent URL parsing and normalization
- Product URL detection

### Real-time Controls
- Start/Stop crawling
- Pause/Resume functionality
- Live progress monitoring
- Real-time crawl statistics
- URL filtering capabilities

### Advanced Features
- Rotating User-Agent headers to prevent blocking
- Intelligent rate limiting with random delays
- Automatic retry mechanism for failed requests
- Error handling and detailed logging
- Concurrent request handling

### User Interface
- Clean, modern dashboard design using Tailwind CSS
- Real-time activity log with timestamps
- Filterable URL list
- Live statistics display
- Responsive design for all screen sizes

## Technology Stack 💻

- **Backend**
  - Node.js
  - Express.js
  - Socket.IO for real-time updates
  - JSDOM for HTML parsing
  - Axios for HTTP requests

- **Frontend**
  - HTML5
  - Tailwind CSS
  - Socket.IO client
  - Vanilla JavaScript

## Prerequisites 📋

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation 🚀

1. Clone the repository:
```bash
git clone https://github.com/PIYUSH-MISHRA-00/web-crawl-hopper.git
cd web-crawl-hopper
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage Guide 📖

### Starting a Crawl
1. Enter the target URL in the input field
2. Set the maximum crawl depth (1-10)
3. Click "Start Crawling"

### Control Options
- **Pause**: Temporarily halt the crawling process
- **Resume**: Continue a paused crawl
- **Stop**: Completely stop the crawling process

### Monitoring
- View real-time statistics in the dashboard
- Monitor the activity log for detailed progress
- Filter and search through discovered URLs
- Track successful and failed crawls

## Project Structure 📁

```
web-crawl-hopper/
├── public/
│   ├── index.html      # Web interface
│   └── styles.css      # Tailwind CSS styles
├── crawl.js           # Core crawler logic
├── server.js          # Express server & Socket.IO setup
├── package.json       # Project dependencies
└── README.md          # Documentation
```

## Key Components ⚙️

### Crawler (\`crawl.js\`)
- Manages the crawling process
- Handles URL queuing and processing
- Implements rate limiting and retries
- Processes robots.txt
- Manages state (running/paused/stopped)

### Server (\`server.js\`)
- Serves the web interface
- Handles API endpoints
- Manages Socket.IO connections
- Broadcasts crawl updates

### Web Interface (\`public/index.html\`)
- Real-time dashboard
- Control panel
- Statistics display
- Activity log
- URL list with filtering

## Error Handling 🛠️

- Automatic retry for failed requests
- Rate limit detection and handling
- Invalid URL filtering
- Detailed error logging
- Graceful error recovery

## Performance Considerations 📊

- Configurable crawl depth
- Random delays between requests
- Concurrent request limiting
- Memory-efficient URL tracking
- Optimized DOM parsing

## Author ✍️

PIYUSH-MISHRA-00

## Acknowledgments 🙏

- Socket.IO for real-time capabilities
- Tailwind CSS for the UI design
- JSDOM for HTML parsing
- Axios for HTTP requests

---

Made with ❤️ by PIYUSH-MISHRA-00