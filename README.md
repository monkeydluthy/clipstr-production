# Klipit Pump Pulse

A Vite + React + TypeScript application for processing Pump.fun videos into TikTok-ready 9:16 MP4s with burned captions.

## Features

- **Video Processing**: Convert Pump.fun MP4s to 9:16 aspect ratio using FFmpeg.wasm
- **Auto Captions**: Generate captions using OpenAI Whisper API
- **Multiple Modes**: Pad, crop center, crop top, or crop bottom to 9:16
- **Supabase Storage**: Upload processed videos to Supabase Storage
- **Real-time Preview**: Preview processed videos before upload
- **Copy Links**: Easy sharing with copy-to-clipboard functionality

## Project info

**URL**: https://lovable.dev/projects/7d1d7c8e-ade7-44c6-8edc-8455a97bdffc

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/7d1d7c8e-ade7-44c6-8edc-8455a97bdffc) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Development Setup

### Prerequisites

- Node.js 20+ 
- npm or yarn
- Supabase account
- OpenAI API key

### Environment Setup

1. **Client Environment** (create `.env.local`):
```bash
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_CAPTIONS_URL=http://localhost:8787/captions
```

2. **Server Environment** (create `server/.env`):
```bash
OPENAI_API_KEY=sk-your_openai_api_key_here
PORT=8787
ALLOWED_ORIGIN=http://localhost:5173
```

### Supabase Setup

1. Create a new Supabase project
2. Go to Storage and create a bucket named `clips`
3. Set the bucket to public read access
4. Add this policy to the bucket:
```sql
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'clips');
```

### Running Locally

```bash
# Install dependencies
npm install

# Start both frontend and backend
npm run dev:all

# Or start individually:
npm run dev          # Frontend only (port 5173)
npm run dev:server   # Backend only (port 8787)
```

## How can I deploy this project?

### Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_CAPTIONS_URL` (set to your Railway app URL)

### Backend Deployment (Railway)

1. Connect your GitHub repository to Railway
2. Set Root Directory to `server/`
3. Set environment variables:
   - `OPENAI_API_KEY`
   - `ALLOWED_ORIGIN` (set to your Vercel domain)
   - `PORT=8787` (optional)

4. After Railway deployment, update `VITE_CAPTIONS_URL` in Vercel with your Railway app URL

### Alternative: Deploy with Lovable

Simply open [Lovable](https://lovable.dev/projects/7d1d7c8e-ade7-44c6-8edc-8455a97bdffc) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
# clipr
