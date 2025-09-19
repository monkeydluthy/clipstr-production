# ClipStr Deployment Guide

## Production Build for Ionos Hosting

This guide will help you deploy ClipStr to your Ionos hosting at clipstr.fun.

### Prerequisites

- Node.js 18+ installed on your server
- FFmpeg installed on your server
- Your OpenAI API key
- (Optional) Supabase credentials

### Step 1: Upload Files to Ionos

1. Upload the entire project folder to your Ionos server
2. Make sure the following files are included:
   - `dist/` folder (built frontend)
   - `server/` folder (backend API)
   - `package.json` (production dependencies)
   - `server/production.js` (production server)

### Step 2: Install Dependencies

```bash
# Install main dependencies
npm install

# Install server dependencies
cd server
npm install --production
cd ..
```

### Step 3: Install FFmpeg on Server

For Ubuntu/Debian:

```bash
sudo apt update
sudo apt install ffmpeg
```

For CentOS/RHEL:

```bash
sudo yum install ffmpeg
```

### Step 4: Configure Environment Variables

1. Copy `env.production.example` to `.env`:

```bash
cp env.production.example .env
```

2. Edit `.env` with your actual credentials:

```bash
nano .env
```

3. Update the following values:
   - `OPENAI_API_KEY`: Your real OpenAI API key
   - `PORT`: Port for your server (default: 3000)
   - (Optional) Supabase credentials if using storage

### Step 5: Start the Production Server

```bash
# Start the production server
node server/production.js
```

Or use PM2 for process management:

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start server/production.js --name clipstr

# Save PM2 configuration
pm2 save
pm2 startup
```

### Step 6: Configure Web Server (Nginx/Apache)

#### For Nginx:

Create `/etc/nginx/sites-available/clipstr.fun`:

```nginx
server {
    listen 80;
    server_name clipstr.fun www.clipstr.fun;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/clipstr.fun /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### For Apache:

Create virtual host configuration and enable mod_proxy.

### Step 7: SSL Certificate (Recommended)

Use Let's Encrypt for free SSL:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d clipstr.fun -d www.clipstr.fun
```

### Step 8: Test Deployment

1. Visit `https://clipstr.fun` in your browser
2. Upload a test video
3. Verify cropping and captions work
4. Check server logs for any errors

### Troubleshooting

#### Common Issues:

1. **FFmpeg not found**: Ensure FFmpeg is installed and in PATH
2. **Permission errors**: Check file permissions on temp directories
3. **Memory issues**: Increase server memory or optimize video processing
4. **CORS errors**: Ensure CORS is properly configured

#### Logs:

- Server logs: Check PM2 logs with `pm2 logs clipstr`
- Nginx logs: `/var/log/nginx/error.log`
- System logs: `journalctl -u nginx`

### Performance Optimization

1. **Enable gzip compression** in Nginx
2. **Set up caching** for static assets
3. **Monitor memory usage** during video processing
4. **Consider CDN** for video delivery

### Security Considerations

1. **Rate limiting** for API endpoints
2. **File size limits** for video uploads
3. **Input validation** for all endpoints
4. **Regular security updates**

### Backup Strategy

1. **Database backups** (if using Supabase)
2. **Code backups** (Git repository)
3. **Configuration backups** (environment files)

## Support

If you encounter issues:

1. Check server logs
2. Verify all dependencies are installed
3. Test API endpoints individually
4. Ensure proper file permissions
