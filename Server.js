const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const app = express();

// Get the current directory path
const currentDir = path.join(__dirname);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(currentDir));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(currentDir, 'index.html'));
});

// Handle download request
app.post('/download', async (req, res) => {
    try {
        const { url, quality } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Set headers for video download
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
        res.setHeader('Transfer-Encoding', 'chunked');

        // Construct yt-dlp command based on quality
        const args = [];
        if (quality && quality !== 'best') {
            args.push('-f', `bestvideo[height<=${quality}]+bestaudio/best[height<=${quality}]`);
        }
        args.push('-o', '-'); // Output to stdout
        args.push(url);

        const downloadProcess = spawn('yt-dlp', args);
        
        downloadProcess.stdout.pipe(res);

        let hasError = false;
        downloadProcess.stderr.on('data', (data) => {
            const message = data.toString();
            // Log all messages for debugging
            console.log('yt-dlp message:', message);
            
            // Check for actual error conditions
            if (message.includes('ERROR:') || 
                message.includes('Fatal error') || 
                message.includes('Permission denied') ||
                message.includes('Unable to download')) {
                hasError = true;
                console.error(`Download error: ${message}`);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        error: `Download error: ${message.trim()}`
                    });
                }
            }
        });

        downloadProcess.on('close', (code) => {
            if (code !== 0 && !res.headersSent && !hasError) {
                res.status(500).json({
                    success: false,
                    error: `Process exited with code ${code}`
                });
            }
        });

        downloadProcess.on('error', (error) => {
            console.error('Error:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    error: 'Download process failed'
                });
            }
        });

    } catch (error) {
        console.error('Server Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ 
                success: false, 
                error: 'Internal server error' 
            });
        }
    }
});

// Add this new endpoint
app.post('/video-info', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const infoProcess = spawn('yt-dlp', ['--dump-json', url]);
        let data = '';

        infoProcess.stdout.on('data', (chunk) => {
            data += chunk;
        });

        infoProcess.on('close', (code) => {
            if (code === 0) {
                try {
                    const videoInfo = JSON.parse(data);
                    res.json({
                        title: videoInfo.title,
                        duration: formatDuration(videoInfo.duration),
                        thumbnail: videoInfo.thumbnail,
                        formats: videoInfo.formats
                    });
                } catch (e) {
                    res.status(500).json({ error: 'Failed to parse video info' });
                }
            } else {
                res.status(500).json({ error: 'Failed to get video info' });
            }
        });

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Helper function to format duration
function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});