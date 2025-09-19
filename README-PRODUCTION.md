# ClipStr - Production Version

## 🎬 Video Processing with AI Captions

ClipStr is a powerful video processing tool that automatically crops videos to TikTok format (9:16) and generates synchronized captions using OpenAI's Whisper API.

### ✨ Features

- **Perfect TikTok Cropping**: Automatically crops videos to 1080x1920 (9:16 aspect ratio)
- **AI-Generated Captions**: Uses OpenAI Whisper for accurate transcription
- **Synchronized Subtitles**: Captions are perfectly timed with speech
- **Multiple Crop Modes**: Center, left, or right cropping options
- **High-Quality Output**: Optimized video compression and quality

### 🚀 Quick Start

1. **Upload the deployment package** to your server
2. **Extract**: `tar -xzf clipstr-production.tar.gz`
3. **Install dependencies**: `npm install && cd server && npm install`
4. **Install FFmpeg**: `sudo apt install ffmpeg` (Ubuntu/Debian)
5. **Configure environment**: Copy `env.production.example` to `.env` and add your OpenAI API key
6. **Start server**: `node server/production.js`

### 📋 Requirements

- **Node.js 18+**
- **FFmpeg** (for video processing)
- **OpenAI API Key** (for captions)
- **2GB+ RAM** (for video processing)

### 🔧 Configuration

Edit `.env` file with your credentials:

```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional (for Supabase storage)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Server settings
PORT=3000
NODE_ENV=production
```

### 🌐 API Endpoints

- `POST /crop-tiktok` - Crop video to TikTok format
- `POST /process-video` - Process video with captions
- `POST /captions` - Generate captions only
- `GET /health` - Health check

### 📖 Full Documentation

See `DEPLOYMENT.md` for complete deployment instructions including:

- Nginx/Apache configuration
- SSL setup
- Performance optimization
- Troubleshooting guide

### 🎯 Usage

1. **Upload a video** to the web interface
2. **Select crop mode** (center, left, or right)
3. **Enable captions** for AI transcription
4. **Process** and download your TikTok-ready video

### 🔒 Security

- Rate limiting recommended for production
- File size limits for uploads
- Input validation on all endpoints

### 📞 Support

For issues or questions:

1. Check server logs
2. Verify FFmpeg installation
3. Test API endpoints individually
4. Ensure proper file permissions

---

**Built with ❤️ for content creators**
