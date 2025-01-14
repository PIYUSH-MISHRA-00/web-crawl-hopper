const { JSDOM } = require('jsdom');
const axios = require('axios');
const RobotsParser = require('robots-parser');
const puppeteer = require('puppeteer');

let robots;
let browserInstance = null;
let isPaused = false;
let shouldStop = false;

// Rotating user agents to avoid blocking
const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
];

function getRandomUserAgent() {
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

async function getRobotsParser(baseUrl) {
    const robotsTxtUrl = new URL('/robots.txt', baseUrl).toString();
    try {
        const resp = await axios.get(robotsTxtUrl);
        robots = RobotsParser(robotsTxtUrl, resp.data);
        console.log(`Fetched robots.txt from ${robotsTxtUrl}`);
    } catch (err) {
        console.log(`Could not fetch robots.txt from ${robotsTxtUrl}: ${err.message}`);
        robots = RobotsParser(robotsTxtUrl, '');
    }
}

async function initializeCrawler(baseUrl) {
    isPaused = false;
    shouldStop = false;
    await getRobotsParser(baseUrl);
}

function pauseCrawling() {
    isPaused = true;
}

function resumeCrawling() {
    isPaused = false;
}

function stopCrawling() {
    shouldStop = true;
}

async function fetchPage(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': getRandomUserAgent(),
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Cache-Control': 'max-age=0'
                },
                timeout: 10000,
                validateStatus: status => status < 500
            });
            
            if (response.status === 200) {
                return response;
            }
            
            // If we get rate limited, wait longer before next retry
            if (response.status === 429 || response.status === 403) {
                await new Promise(resolve => setTimeout(resolve, (i + 1) * 5000));
                continue;
            }
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, (i + 1) * 2000));
        }
    }
    throw new Error(`Failed to fetch ${url} after ${retries} retries`);
}

async function crawl(baseUrl, maxDepth, updateCallback) {
    const visited = new Set();
    const queue = [{ url: baseUrl, depth: 0 }];
    let pagesCrawled = 0;
    const results = {
        totalPages: 0,
        successfulCrawls: 0,
        failedCrawls: 0,
        productPages: 0,
        crawledUrls: [],
        errors: [],
        status: 'running'
    };

    // Normalize the base URL to handle both with and without trailing slash
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

    try {
        while (queue.length > 0 && !shouldStop) {
            if (isPaused) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }

            const { url, depth } = queue.shift();
            
            // Skip if already visited or depth exceeds maximum
            if (visited.has(url) || depth > maxDepth) {
                continue;
            }

            // Skip if URL is not under the base URL
            if (!url.startsWith(normalizedBaseUrl)) {
                continue;
            }

            visited.add(url);
            pagesCrawled++;
            results.totalPages++;

            updateCallback({
                type: 'stats',
                pagesCrawled,
                queueSize: queue.length,
                currentDepth: depth,
                results: { ...results }
            });
            
            updateCallback({
                type: 'log',
                message: `Crawling: ${url} (Depth: ${depth}/${maxDepth})`
            });

            try {
                const response = await fetchPage(url);
                results.successfulCrawls++;
                
                const urlData = {
                    url,
                    depth,
                    status: response.status,
                    timestamp: new Date().toISOString()
                };
                
                results.crawledUrls.push(urlData);

                // Emit URL update
                updateCallback({
                    type: 'url',
                    url: url
                });

                if (isProductURL(url)) {
                    results.productPages++;
                }

                // Only process links if we haven't reached max depth
                if (depth < maxDepth) {
                    const dom = new JSDOM(response.data);
                    const links = dom.window.document.querySelectorAll('a');
                    
                    for (const link of links) {
                        try {
                            const href = new URL(link.href, url).href;
                            if (!visited.has(href) && 
                                href.startsWith(normalizedBaseUrl) && 
                                !href.includes('#')) { // Skip anchor links
                                queue.push({ url: href, depth: depth + 1 });
                            }
                        } catch (e) {
                            // Invalid URL, skip
                        }
                    }
                }

                // Random delay between 1-3 seconds to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

            } catch (error) {
                results.failedCrawls++;
                results.errors.push({
                    url,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });

                updateCallback({
                    type: 'log',
                    message: `Error crawling ${url}: ${error.message}`
                });

                // Longer delay after errors
                await new Promise(resolve => setTimeout(resolve, 5000));
            }

            // Send periodic updates
            if (pagesCrawled % 5 === 0) {
                updateCallback({
                    type: 'results',
                    results: { ...results }
                });
            }
        }
    } catch (error) {
        updateCallback({
            type: 'log',
            message: `Crawling error: ${error.message}`
        });
    }

    // Send final results
    results.status = shouldStop ? 'stopped' : 'completed';
    updateCallback({
        type: 'status',
        status: results.status
    });
    updateCallback({
        type: 'results',
        results: { ...results }
    });

    return results;
}

function isProductURL(url) {
    return /\/(product|item|p|shop)\//.test(url);
}

module.exports = {
    crawl,
    initializeCrawler,
    pauseCrawling,
    resumeCrawling,
    stopCrawling
};