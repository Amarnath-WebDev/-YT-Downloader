async function getVideoInfo(url) {
    try {
        const response = await fetch('https://yt-downloader-a0kq.onrender.com/video-info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch video info');
        }

        const videoInfo = await response.json();
        return videoInfo;
    } catch (error) {
        console.error('Error fetching video info:', error);
        return null;
    }
}

async function showVideoQualities() {
    const videoUrl = document.getElementById('videoUrl').value;
    const statusDiv = document.getElementById('status');
    const qualitySelector = document.getElementById('qualitySelector');
    const videoQualitySelect = document.getElementById('videoQuality');
    const buttonText = document.getElementById('buttonText');
    const qualityLoading = document.getElementById('qualityLoading');

    if (!videoUrl) {
        statusDiv.textContent = 'Please enter a valid YouTube URL';
        return;
    }

    try {
        // Show loading animation
        buttonText.textContent = 'Loading...';
        qualityLoading.style.display = 'block';
        
        // Hide other elements
        qualitySelector.style.display = 'none';
        document.getElementById('videoInfo').style.display = 'none';

        // Add minimum delay for better UX
        const [videoInfo] = await Promise.all([
            getVideoInfo(videoUrl),
            new Promise(resolve => setTimeout(resolve, 2000)) // Minimum 2s delay
        ]);
        
        if (videoInfo && videoInfo.formats) {
            // Clear existing options
            videoQualitySelect.innerHTML = '';
            
            // Add best quality option
            const bestOption = document.createElement('option');
            bestOption.value = 'best';
            bestOption.textContent = 'Best Quality (Auto)';
            videoQualitySelect.appendChild(bestOption);

            // Define standard qualities we want to show (360p and above)
            const standardQualities = [2160, 1440, 1080, 720, 480, 360];
            
            // Filter and add available qualities
            const uniqueQualities = new Set();
            videoInfo.formats
                .filter(format => format.height && format.height >= 360)
                .sort((a, b) => b.height - a.height)
                .forEach(format => {
                    if (!uniqueQualities.has(format.height)) {
                        if (standardQualities.includes(format.height)) {
                            uniqueQualities.add(format.height);
                            const option = document.createElement('option');
                            option.value = format.height;
                            option.textContent = `${format.height}p`;
                            videoQualitySelect.appendChild(option);
                        }
                    }
                });

            // Hide loading animation
            qualityLoading.style.display = 'none';

            // Show video info and quality selector with animation
            const videoInfoElement = document.getElementById('videoInfo');
            videoInfoElement.style.display = 'block';
            videoInfoElement.style.animation = 'slideUp 0.5s ease forwards';

            document.getElementById('thumbnailImg').src = videoInfo.thumbnail;
            document.getElementById('videoTitle').textContent = videoInfo.title;
            document.getElementById('videoDuration').textContent = `Duration: ${videoInfo.duration}`;
            
            // Show quality selector with animation
            qualitySelector.style.display = 'block';
            qualitySelector.style.animation = 'dropDown 0.5s ease forwards';
            
            // Store video title
            videoInfoElement.dataset.videoTitle = videoInfo.title;
            
            // Update button and status
            buttonText.textContent = 'Download';
            const statusMessage = document.getElementById('statusMessage');
            statusDiv.textContent = ''; // Clear old status
            statusMessage.style.display = 'block';
            
            // Reset animation
            statusMessage.style.animation = 'none';
            statusMessage.offsetHeight; // Trigger reflow
            statusMessage.style.animation = 'fadeInUp 0.5s ease forwards';
        }
    } catch (error) {
        const statusMessage = document.getElementById('statusMessage');
        statusMessage.style.display = 'none';
        statusDiv.textContent = `Error: ${error.message}`;
        buttonText.textContent = 'Get Qualities';
    }
}

async function downloadVideo() {
    const videoUrl = document.getElementById('videoUrl').value;
    const statusDiv = document.getElementById('status');
    const downloadButton = document.querySelector('button');
    const downloadProgress = document.getElementById('downloadProgress');
    const downloadStatus = document.getElementById('downloadStatus');
    const progressFill = document.querySelector('.progress-fill');
    const progressPercentage = document.getElementById('progressPercentage');
    const videoQuality = document.getElementById('videoQuality');
    const downloadComplete = document.getElementById('downloadComplete');
    const downloadStats = document.getElementById('downloadStats');
    const buttonText = document.getElementById('buttonText');

    const videoTitle = document.getElementById('videoInfo').dataset.videoTitle || 'video';
    const safeVideoTitle = videoTitle.replace(/[^\w\s-]/g, '').trim();

    try {
        downloadButton.disabled = true;
        buttonText.textContent = 'Downloading...';
        downloadProgress.style.display = 'block';
        downloadComplete.style.display = 'none';
        statusDiv.className = 'status downloading';
        
        const startTime = Date.now();
        let progress = 0;
        
        const progressInterval = setInterval(() => {
            if (progress < 90) {
                progress += Math.random() * 2;
                progress = Math.min(progress, 90);
                progressFill.style.width = `${progress}%`;
                progressPercentage.textContent = `${Math.round(progress)}%`;
            }
            
            const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(1);
            downloadStatus.innerHTML = `Downloading "${safeVideoTitle}"<br>Quality: ${videoQuality.value}p<br>Time elapsed: ${elapsedTime}s`;
        }, 100);

        const response = await fetch('http://localhost:3000/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                url: videoUrl,
                quality: videoQuality.value 
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData);
        }

        // Create a readable stream from the response
        const reader = response.body.getReader();
        const chunks = [];
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
        }

        // Combine chunks into a single Uint8Array
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const combinedChunks = new Uint8Array(totalLength);
        let position = 0;
        
        for (const chunk of chunks) {
            combinedChunks.set(chunk, position);
            position += chunk.length;
        }

        // Create blob and download
        const blob = new Blob([combinedChunks], { type: 'video/mp4' });
        
        // Complete the progress
        clearInterval(progressInterval);
        progressFill.style.width = '100%';
        progressPercentage.textContent = '100%';
        
        const endTime = Date.now();
        const downloadTime = ((endTime - startTime) / 1000).toFixed(2);
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${safeVideoTitle}.mp4`;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Show completion message
        downloadProgress.style.display = 'none';
        downloadComplete.style.display = 'block';
        downloadStats.innerHTML = `
            "${safeVideoTitle}"<br>
            Download completed in ${downloadTime} seconds<br>
            Quality: ${videoQuality.value}p<br>
            Size: ${(blob.size / (1024 * 1024)).toFixed(2)} MB
        `;

        buttonText.textContent = 'Get Qualities';
        
        setTimeout(() => {
            downloadComplete.style.display = 'none';
            progressFill.style.width = '0%';
            progressPercentage.textContent = '0%';
        }, 5000);

    } catch (error) {
        clearInterval(progressInterval);
        downloadStatus.textContent = `Error: ${error.message}`;
        statusDiv.textContent = `Error: ${error.message}`;
        statusDiv.className = 'status';
        progressFill.style.width = '0%';
        progressPercentage.textContent = '0%';
        buttonText.textContent = 'Get Qualities';
    } finally {
        downloadButton.disabled = false;
    }

    const statusMessage = document.getElementById('statusMessage');
    statusMessage.style.display = 'none';
}

// Add input event listener to show/hide quality selector
document.getElementById('videoUrl').addEventListener('input', async function(e) {
    const qualitySelector = document.getElementById('qualitySelector');
    const videoInfo = document.getElementById('videoInfo');
    
    if (e.target.value.trim() === '') {
        qualitySelector.style.display = 'none';
        videoInfo.style.display = 'none';
    }
});

// Update the download button click handler
document.querySelector('button').onclick = async function() {
    const qualitySelector = document.getElementById('qualitySelector');
    const buttonText = document.getElementById('buttonText');
    
    if (qualitySelector.style.display === 'none') {
        // First click: Show qualities
        await showVideoQualities();
    } else {
        // Second click: Start download
        downloadVideo();
    }
};

// Add these event listeners at the end of your script
document.getElementById('videoUrl').addEventListener('paste', async (e) => {
    const urlInput = e.target;
    const urlPreviewAnimation = document.getElementById('urlPreviewAnimation');
    const videoInfo = document.getElementById('videoInfo');
    const qualitySelector = document.getElementById('qualitySelector');

    // Add pulse animation to input
    urlInput.classList.add('input-pulse');
    setTimeout(() => urlInput.classList.remove('input-pulse'), 500);

    // Show loading animation
    urlPreviewAnimation.style.display = 'block';
    videoInfo.style.display = 'none';
    qualitySelector.style.display = 'none';

    // Wait for the paste to complete
    setTimeout(async () => {
        const pastedUrl = urlInput.value;
        if (pastedUrl) {
            try {
                // Show loading animation for at least 1 second for better UX
                await new Promise(resolve => setTimeout(resolve, 1000));
                await showVideoQualities();
            } finally {
                urlPreviewAnimation.style.display = 'none';
            }
        }
    }, 0);
}); 
