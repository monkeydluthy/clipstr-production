const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import the existing server logic
const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration for production
const allowedOrigins = [
  'https://clipstr.fun',
  'https://www.clipstr.fun',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:8083',
  'http://localhost:8084',
  'http://localhost:8085',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Health check endpoint
app.get('/health', (req, res) => {
  const uptime = process.uptime();
  const memory = process.memoryUsage();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: uptime,
    memory: {
      rss: memory.rss,
      heapTotal: memory.heapTotal,
      heapUsed: memory.heapUsed,
      external: memory.external,
      arrayBuffers: memory.arrayBuffers,
    },
  });
});

// API endpoints (import from existing server)
const ffmpeg = require('fluent-ffmpeg');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const { unlinkSync } = require('fs');

// Set FFmpeg paths to use system binaries
const ffmpegPath = '/usr/bin/ffmpeg';
const ffprobePath = '/usr/bin/ffprobe';

// Set FFmpeg paths
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions
function generateVideoFileName(prefix) {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${randomId}.mp4`;
}

async function uploadVideoToSupabase(videoBuffer, fileName) {
  try {
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(fileName, videoBuffer, {
        contentType: 'video/mp4',
        upsert: false,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    const { data: urlData } = supabase.storage
      .from('videos')
      .getPublicUrl(fileName);

    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function cleanupTempFiles(...paths) {
  for (const filePath of paths) {
    if (filePath && fs.existsSync(filePath)) {
      try {
        unlinkSync(filePath);
      } catch (error) {
        console.warn(`Failed to delete temp file ${filePath}:`, error.message);
      }
    }
  }
}

// TikTok cropping endpoint
app.post('/crop-tiktok', async (req, res) => {
  try {
    const { mp4Url, mode = 'crop-center-9x16' } = req.body;

    if (!mp4Url) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    console.log('Crop-tiktok endpoint called:', { mp4Url, mode });

    // Download video
    const videoResponse = await fetch(mp4Url);
    if (!videoResponse.ok) {
      throw new Error(`Failed to download video: ${videoResponse.statusText}`);
    }
    const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());

    // Create temp files
    const inputPath = path.join(__dirname, `temp_input_${Date.now()}.mp4`);
    const outputPath = path.join(__dirname, `temp_output_${Date.now()}.mp4`);

    fs.writeFileSync(inputPath, videoBuffer);

    // Build FFmpeg filter based on mode
    let filter;
    switch (mode) {
      case 'crop-center-9x16':
        filter = 'crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920';
        break;
      case 'crop-left-9x16':
        filter = 'crop=ih*9/16:ih:0:0,scale=1080:1920';
        break;
      case 'crop-right-9x16':
        filter = 'crop=ih*9/16:ih:(iw-ih*9/16):0,scale=1080:1920';
        break;
      default:
        filter = 'crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920';
    }

    // Process video with FFmpeg
    let processedBuffer;
    try {
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .videoFilter(filter)
          .outputOptions([
            '-crf',
            '28',
            '-preset',
            'fast',
            '-b:a',
            '96k',
            '-movflags',
            '+faststart',
          ])
          .output(outputPath)
          .on('end', resolve)
          .on('error', reject)
          .run();
      });

      processedBuffer = fs.readFileSync(outputPath);
      console.log('Video cropping completed');
    } catch (ffmpegError) {
      console.error('FFmpeg error:', ffmpegError);
      processedBuffer = videoBuffer; // Fallback to original
    }

    // Clean up temp files
    await cleanupTempFiles(inputPath, outputPath);

    // Return processed video directly
    const fileName = generateVideoFileName('cropped');
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Length', processedBuffer.length);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(processedBuffer);
  } catch (error) {
    console.error('TikTok crop error:', error);
    res
      .status(500)
      .json({ error: 'Failed to process video', details: error.message });
  }
});

// Process video with captions endpoint
app.post('/process-video', async (req, res) => {
  try {
    const { mp4Url, mode = 'crop-center-9x16', captions } = req.body;

    if (!mp4Url) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    console.log('Process-video endpoint called:', {
      mp4Url,
      mode,
      hasCaptions: !!captions,
    });

    // Download video
    const videoResponse = await fetch(mp4Url);
    if (!videoResponse.ok) {
      throw new Error(`Failed to download video: ${videoResponse.statusText}`);
    }
    const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());

    // Create temp files
    const inputPath = path.join(__dirname, `temp_input_${Date.now()}.mp4`);
    const outputPath = path.join(__dirname, `temp_output_${Date.now()}.mp4`);
    const subsPath = path.join(__dirname, `temp_subs_${Date.now()}.ass`);

    fs.writeFileSync(inputPath, videoBuffer);

    // Build base filter
    let baseFilter;
    switch (mode) {
      case 'crop-center-9x16':
        baseFilter = 'crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920';
        break;
      case 'crop-left-9x16':
        baseFilter = 'crop=ih*9/16:ih:0:0,scale=1080:1920';
        break;
      case 'crop-right-9x16':
        baseFilter = 'crop=ih*9/16:ih:(iw-ih*9/16):0,scale=1080:1920';
        break;
      default:
        baseFilter = 'crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920';
    }

    // Add subtitles if captions provided
    let finalFilter = baseFilter;
    if (captions) {
      // Convert SRT to ASS format
      const assContent = convertSRTToASS(captions);
      fs.writeFileSync(subsPath, assContent);
      finalFilter = `${baseFilter},subtitles='${subsPath}':force_style='FontSize=36,Outline=2'`;
    }

    // Process video with FFmpeg
    let processedBuffer;
    try {
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .videoFilter(finalFilter)
          .outputOptions([
            '-crf',
            '28',
            '-preset',
            'fast',
            '-b:a',
            '96k',
            '-movflags',
            '+faststart',
          ])
          .output(outputPath)
          .on('end', resolve)
          .on('error', reject)
          .run();
      });

      processedBuffer = fs.readFileSync(outputPath);
      console.log('Video processing with captions completed');
    } catch (ffmpegError) {
      console.error('FFmpeg error:', ffmpegError);
      processedBuffer = videoBuffer; // Fallback to original
    }

    // Clean up temp files
    await cleanupTempFiles(inputPath, outputPath, subsPath);

    // Return processed video directly
    const fileName = generateVideoFileName('processed');
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Length', processedBuffer.length);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(processedBuffer);
  } catch (error) {
    console.error('Video processing error:', error);
    res
      .status(500)
      .json({ error: 'Failed to process video', details: error.message });
  }
});

// Captions generation endpoint
app.post('/captions', async (req, res) => {
  try {
    const { mp4Url } = req.body;

    if (!mp4Url) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    console.log('Processing captions for:', mp4Url);

    // Download and process video for captions
    const videoResponse = await fetch(mp4Url);
    if (!videoResponse.ok) {
      throw new Error(`Failed to download video: ${videoResponse.statusText}`);
    }
    const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());

    // Create temp files
    const inputPath = path.join(__dirname, `temp_input_${Date.now()}.mp4`);
    const outputPath = path.join(__dirname, `temp_output_${Date.now()}.mp4`);

    fs.writeFileSync(inputPath, videoBuffer);

    // Crop video for captions (9:16 format)
    try {
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .videoFilter('crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920')
          .outputOptions(['-crf', '28', '-preset', 'fast'])
          .output(outputPath)
          .on('end', resolve)
          .on('error', reject)
          .run();
      });
      console.log('Video cropping for captions completed');
    } catch (error) {
      console.log('FFmpeg not available, using original video for captions');
    }

    // Generate captions using OpenAI
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const formData = new FormData();
    const videoBlob = new Blob([fs.readFileSync(outputPath || inputPath)]);
    formData.append('file', videoBlob, 'video.mp4');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'srt');

    const openaiResponse = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: formData,
      }
    );

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      throw new Error(
        `OpenAI API error: ${openaiResponse.status} ${JSON.stringify(
          errorData
        )}`
      );
    }

    const captions = await openaiResponse.text();
    console.log('Captions generated successfully');

    // Clean up temp files
    await cleanupTempFiles(inputPath, outputPath);

    res.json({ success: true, captions });
  } catch (error) {
    console.error('Captions generation error:', error);
    res
      .status(500)
      .json({ error: 'Failed to generate captions', details: error.message });
  }
});

// Helper function to convert SRT to ASS
function convertSRTToASS(srtContent) {
  const lines = srtContent.split('\n');
  const assLines = [
    '[Script Info]',
    'Title: Generated Subtitles',
    'ScriptType: v4.00+',
    '',
    '[V4+ Styles]',
    'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
    'Style: Default,Arial,36,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,1',
    '',
    '[Events]',
    'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
  ];

  let currentIndex = 0;
  while (currentIndex < lines.length) {
    const line = lines[currentIndex].trim();

    if (line.match(/^\d+$/)) {
      // This is a subtitle number, skip it
      currentIndex++;
      continue;
    }

    if (line.includes('-->')) {
      // This is a timestamp line
      const [start, end] = line.split(' --> ').map((t) => t.trim());
      currentIndex++;

      // Collect subtitle text
      const textLines = [];
      while (currentIndex < lines.length && lines[currentIndex].trim() !== '') {
        textLines.push(lines[currentIndex].trim());
        currentIndex++;
      }

      if (textLines.length > 0) {
        const text = textLines.join('\\N');
        const startTime = convertSRTTimeToASS(start);
        const endTime = convertSRTTimeToASS(end);

        assLines.push(
          `Dialogue: 0,${startTime},${endTime},Default,,0,0,0,,${text}`
        );
      }
    }

    currentIndex++;
  }

  return assLines.join('\n');
}

function convertSRTTimeToASS(srtTime) {
  // Convert from SRT format (00:00:15,780) to ASS format (0:00:15.78)
  const [time, ms] = srtTime.split(',');
  const [hours, minutes, seconds] = time.split(':');
  return `${hours}:${minutes}:${seconds}.${ms.substring(0, 2)}`;
}

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ClipStr production server running on port ${PORT}`);
  console.log(`🌐 Server accessible at: http://0.0.0.0:${PORT}`);
  console.log(`✅ Server is ready to accept requests`);
});

module.exports = app;
