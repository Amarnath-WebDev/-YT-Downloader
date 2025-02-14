# 🎥 YouTube Video Downloader

A modern web application for downloading YouTube videos with a sleek interface and quality selection options.

<p align="center">
  <img src="demo.gif" alt="YouTube Downloader Demo" width="600px">
</p>

## ✨ Features

- 🎯 Multiple quality options (360p to 4K)
- 🚀 Real-time download progress
- 📱 Responsive design for all devices
- 🎨 Modern UI with smooth animations
- 💾 Automatic video title preservation
- ⚡ Fast download speeds
- 🔍 Video preview with thumbnail
- ⏱️ Download time tracking

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp#installation)

## Installation

1. Clone the repository: `
git clone https://github.com/Amarnath-WebDev/-YT-Downloader.git`

2. Install dependencies:

```
npm install
```

3. Start the server:
```
node server.js
````

5. Open your browser and navigate to:
 ```
http://localhost:3000
````

## Technologies Used

- Frontend:

  - HTML5
  - CSS3 (with modern animations)
  - JavaScript (ES6+)
  - Font Awesome Icons

- Backend:
  - Node.js
  - Express.js
  - yt-dlp

## Features in Detail

### Video Information Retrieval

- Automatic video title and thumbnail fetching
- Duration display
- Available quality detection

### Quality Selection

- Supports multiple quality options
- Best quality auto-selection
- Quality-specific downloads

### Download Process

- Real-time progress tracking
- Download size display
- Time elapsed monitoring
- Completion statistics

### User Interface

- Responsive design
- Modern animations
- Loading indicators
- Error handling
- Status updates

## API Endpoints

### POST /video-info

Fetches video information including available qualities

### POST /download

Downloads the selected quality of the video

## Error Handling

The application handles various error scenarios:

- Invalid URLs
- Network issues
- Download failures
- Server errors
- Quality selection issues

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) for video downloading capabilities
- [Express.js](https://expressjs.com/) for the server framework
- [Font Awesome](https://fontawesome.com/) for icons

## Support

For support, email your-email@example.com or open an issue in the repository.

## Screenshots

### Desktop View

![Desktop View](desktop-screenshot.png)

### Mobile View

![Mobile View](mobile-screenshot.png)

## Future Enhancements

- [ ] Playlist downloading support
- [ ] Custom filename templates
- [ ] Download queue system
- [ ] User preferences storage
- [ ] More format options
- [ ] Download speed limiter
- [ ] Dark/Light theme toggle

## Security

This application implements several security measures:

- Input validation
- Error handling
- Safe file handling
- Resource cleanup

## Performance

The application is optimized for:

- Fast video processing
- Efficient memory usage
- Smooth animations
- Responsive interface

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)

## Known Issues

Please check the [Issues](https://github.com/Amarnath-WebDev/-YT-Downloader.git) page for current known issues and planned fixes.
