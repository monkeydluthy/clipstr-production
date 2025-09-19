# ClipStr VPS Update Instructions

## What's New in This Update

✅ **Improved Video Cards UI** - Professional, clean design with better tags and duration styling
✅ **Fixed API Configuration** - Proper production domain handling for clipstr.fun
✅ **Updated CORS Settings** - Fixed for production deployment
✅ **Enhanced Server Configuration** - Better error handling and performance

## Quick Update Steps

### 1. Upload New Files

Upload these files to your VPS (replace the existing ones):

- `dist/` folder (new frontend build)
- `server/` folder (updated backend)
- `package.json` (updated dependencies)
- `start.sh` (updated startup script)

### 2. Update Dependencies

```bash
# Install any new dependencies
npm install --production
cd server
npm install --production
cd ..
```

### 3. Restart the Application

```bash
# Stop current process (if using PM2)
pm2 stop clipstr

# Start with new version
./start.sh

# Or with PM2
pm2 start server/production.js --name clipstr
pm2 save
```

### 4. Test the Update

- Visit your site at https://clipstr.fun
- Test video processing with cropping and captions
- Verify the new professional UI design

## Files Changed

- Frontend: Updated video card styling, improved professional appearance
- Backend: Fixed API base URL configuration for production
- CORS: Updated to allow clipstr.fun domain
- Server: Enhanced production server configuration

The update maintains all existing functionality while improving the UI and fixing production deployment issues.
