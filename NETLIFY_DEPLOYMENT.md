# Netlify Deployment Guide

This project has been migrated from Railway/Vercel to Netlify with Netlify Functions.

## Architecture

- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Backend**: Netlify Functions (Node.js)
- **Video Processing**: Client-side FFmpeg.wasm
- **Captions**: OpenAI Whisper via Netlify Function

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Set these in your Netlify dashboard under Site Settings > Environment Variables:
   - `OPENAI_API_KEY`: Your OpenAI API key for Whisper captions
   
   **How to set environment variables in Netlify:**
   1. Go to your Netlify dashboard
   2. Select your site
   3. Go to Site Settings > Environment Variables
   4. Click "Add variable"
   5. Add `OPENAI_API_KEY` with your OpenAI API key value
   6. Click "Save"

3. **Local Development**:
   ```bash
   npm run dev:netlify
   ```

4. **Build**:
   ```bash
   npm run build
   ```

## Deployment

1. **Connect to Netlify**:
   - Push your code to GitHub
   - Connect your repository to Netlify
   - Netlify will automatically detect the `netlify.toml` configuration

2. **Build Settings** (should be auto-detected):
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

3. **Environment Variables**:
   - Add `OPENAI_API_KEY` in Netlify dashboard

## Features

- ✅ **Client-side Video Processing**: All video cropping and caption burning happens in the browser using FFmpeg.wasm
- ✅ **Netlify Functions**: Captions generation via OpenAI Whisper
- ✅ **No Server Dependencies**: No need for Railway or external servers
- ✅ **CORS-free**: All processing happens client-side

## API Endpoints

- `/.netlify/functions/captions` - Generate captions from video using OpenAI Whisper
- `/.netlify/functions/proxy-video` - Proxy video downloads to handle CORS issues

## File Structure

```
├── netlify/
│   └── functions/
│       ├── captions.js          # OpenAI Whisper function
│       └── proxy-video.js       # Video download proxy (CORS)
├── src/
│   └── components/
│       └── ClipForm.tsx         # Main video processing component
├── netlify.toml                 # Netlify configuration
└── package.json                 # Dependencies and scripts
```

## Migration Notes

- Removed Railway/Vercel dependencies
- Moved from server-side FFmpeg to client-side FFmpeg.wasm
- Captions generation now uses Netlify Functions
- All video processing happens in the browser
