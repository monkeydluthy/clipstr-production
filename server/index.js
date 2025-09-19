import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import { writeFileSync, unlinkSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import {
  uploadVideoToSupabase,
  generateVideoFileName,
} from './supabase-storage.js';

dotenv.config();

// Point fluent-ffmpeg to the packaged binaries
try {
  ffmpeg.setFfmpegPath(ffmpegInstaller.path);
  ffmpeg.setFfprobePath(ffprobeInstaller.path);
  console.log('ffmpeg: Available');
  console.log('ffprobe: Available');
} catch (error) {
  console.error('FFmpeg setup error:', error);
  console.log('ffmpeg: Error - will use system FFmpeg');
  console.log('ffprobe: Error - will use system FFprobe');
}

console.log('Environment variables loaded:');
console.log(
  'OPENAI_API_KEY:',
  process.env.OPENAI_API_KEY ? 'Present' : 'Missing'
);
console.log('PORT:', process.env.PORT);
console.log('ALLOWED_ORIGIN:', process.env.ALLOWED_ORIGIN);

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const PORT = isProd
  ? Number(process.env.PORT)
  : Number(process.env.PORT || 8787);
// CORS configuration - allow both origins
const allowlist = new Set([
  'https://clipstr.fun',
  'https://www.clipstr.fun',
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:8083',
  'http://localhost:8084',
  'http://localhost:8085',
]);

// Middleware
app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // curl / server-to-server
      cb(null, allowlist.has(origin));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
// Handle preflight requests for all routes
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.status(200).end();
  } else {
    next();
  }
});
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// Root endpoint for Railway health checks
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'klipit-pump-pulse-server',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Handle POST requests to root (Railway health checks)
app.post('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'klipit-pump-pulse-server',
    timestamp: new Date().toISOString(),
  });
});

// Note: /crop-tiktok endpoint is defined later in the file

// Additional health check for Railway
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Simple health check for Railway
app.get('/status', (req, res) => {
  res.status(200).send('OK');
});

// Note: Catch-all route moved to end of file

// Video download endpoint (to avoid CORS issues)
app.post('/download', async (req, res) => {
  try {
    const { videoUrl } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ error: 'videoUrl is required' });
    }

    if (!videoUrl.endsWith('.mp4')) {
      return res.status(400).json({ error: 'URL must end with .mp4' });
    }

    console.log(`Downloading video: ${videoUrl}`);

    // Download the video file
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error(
        `Failed to download video: ${videoResponse.status} ${videoResponse.statusText}`
      );
    }

    // Check file size (limit to 160MB)
    const contentLength = videoResponse.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 160 * 1024 * 1024) {
      return res
        .status(400)
        .json({ error: 'Video file too large (max 160MB)' });
    }

    const videoBuffer = await videoResponse.arrayBuffer();

    // Return the video as binary data
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Length', videoBuffer.byteLength);
    res.send(Buffer.from(videoBuffer));
  } catch (error) {
    console.error('Video download error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

// TikTok crop endpoint (real 9:16 crop with FFmpeg)
app.post('/crop-tiktok', async (req, res) => {
  let inputPath = null;
  let outputPath = null;

  try {
    const { videoUrl, mp4Url, mode = 'crop-center-9x16' } = req.body;
    const videoUrlToUse = videoUrl || mp4Url;

    console.log('Crop-tiktok endpoint called:', {
      videoUrl,
      mp4Url,
      mode,
      videoUrlToUse,
    });

    if (!videoUrlToUse) {
      console.log('Error: No video URL provided');
      return res.status(400).json({ error: 'videoUrl or mp4Url is required' });
    }

    if (!videoUrlToUse.endsWith('.mp4')) {
      console.log('Error: URL does not end with .mp4');
      return res.status(400).json({ error: 'URL must end with .mp4' });
    }

    console.log(`Cropping video to TikTok format: ${videoUrlToUse}`);

    // Download the video file
    const videoResponse = await fetch(videoUrlToUse);
    if (!videoResponse.ok) {
      throw new Error(
        `Failed to download video: ${videoResponse.status} ${videoResponse.statusText}`
      );
    }

    const videoBuffer = await videoResponse.arrayBuffer();

    // Create temporary files
    const timestamp = Date.now();
    inputPath = join(process.cwd(), `temp_input_${timestamp}.mp4`);
    outputPath = join(process.cwd(), `temp_output_${timestamp}.mp4`);

    // Write input file
    writeFileSync(inputPath, Buffer.from(videoBuffer));

    // Check if FFmpeg is available
    let processedBuffer;
    try {
      // Configure FFmpeg with optimized compression for Supabase Storage
      let ffmpegCommand = ffmpeg(inputPath).outputOptions([
        '-c:v',
        'libx264',
        '-preset',
        'fast',
        '-crf',
        '28', // Higher CRF for better compression (was 23)
        '-c:a',
        'aac',
        '-b:a',
        '96k', // Lower audio bitrate (was 128k)
        '-movflags',
        '+faststart', // Optimize for web streaming
        '-profile:v',
        'baseline', // Use baseline profile for better compatibility
      ]);

      // Apply cropping based on mode
      switch (mode) {
        case 'pad-9x16':
          ffmpegCommand = ffmpegCommand.outputOptions([
            '-vf',
            'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black',
          ]);
          break;
        case 'crop-center-9x16':
          ffmpegCommand = ffmpegCommand.outputOptions([
            '-vf',
            'crop=ih*9/16:ih:(iw-ih*9/16)/2:0',
          ]);
          break;
        case 'crop-top-9x16':
          ffmpegCommand = ffmpegCommand.outputOptions([
            '-vf',
            'crop=ih*9/16:ih:0:0',
          ]);
          break;
        case 'crop-bottom-9x16':
          ffmpegCommand = ffmpegCommand.outputOptions([
            '-vf',
            'crop=ih*9/16:ih:iw-ih*9/16:0',
          ]);
          break;
        default:
          ffmpegCommand = ffmpegCommand.outputOptions([
            '-vf',
            'crop=ih*9/16:ih:(iw-ih*9/16)/2:0',
          ]);
      }

      // Process video
      await new Promise((resolve, reject) => {
        ffmpegCommand
          .output(outputPath)
          .on('end', () => {
            console.log('Video cropping completed');
            resolve();
          })
          .on('error', (err) => {
            console.error('FFmpeg error:', err);
            reject(err);
          })
          .run();
      });

      // Read the processed video
      processedBuffer = readFileSync(outputPath);
    } catch (ffmpegError) {
      console.log('FFmpeg not available, returning original video with note');
      // If FFmpeg fails, return the original video with a note
      processedBuffer = videoBuffer;
    }

    // Clean up temporary files
    try {
      unlinkSync(inputPath);
      unlinkSync(outputPath);
    } catch (cleanupError) {
      console.warn('Failed to clean up temp files');
    }

    // Return the processed video directly (bypassing Supabase for local development)
    const fileName = generateVideoFileName('cropped');

    // Set appropriate headers for video response
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Length', (processedBuffer || videoBuffer).length);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Send the processed video directly
    res.send(processedBuffer || videoBuffer);
  } catch (error) {
    console.error('TikTok crop error:', error);

    // Clean up temporary files on error
    try {
      if (inputPath) unlinkSync(inputPath);
      if (outputPath) unlinkSync(outputPath);
    } catch (cleanupError) {
      console.warn('Failed to clean up temp files');
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

// New endpoint for processing video with burned-in captions
app.post('/process-video', async (req, res) => {
  let inputPath = null;
  let outputPath = null;
  let subsPath = null;

  try {
    const { mp4Url, mode = 'crop-center-9x16', captions } = req.body;

    console.log('Process-video endpoint called:', {
      mp4Url,
      mode,
      hasCaptions: !!captions,
    });

    if (!mp4Url) {
      return res.status(400).json({ error: 'mp4Url is required' });
    }

    if (!mp4Url.endsWith('.mp4')) {
      return res.status(400).json({ error: 'URL must end with .mp4' });
    }

    if (!captions) {
      return res.status(400).json({ error: 'captions are required' });
    }

    console.log(`Processing video with captions: ${mp4Url}`);

    // Download the video file
    const videoResponse = await fetch(mp4Url);
    if (!videoResponse.ok) {
      throw new Error(
        `Failed to download video: ${videoResponse.status} ${videoResponse.statusText}`
      );
    }

    const videoBuffer = await videoResponse.arrayBuffer();
    const timestamp = Date.now();
    inputPath = join(process.cwd(), `temp_input_process_${timestamp}.mp4`);
    outputPath = join(process.cwd(), `temp_output_process_${timestamp}.mp4`);
    subsPath = join(process.cwd(), `temp_subs_${timestamp}.ass`);

    // Write input file
    writeFileSync(inputPath, Buffer.from(videoBuffer));

    // Convert SRT to ASS format
    console.log('SRT content preview:', captions.substring(0, 200) + '...');
    const assContent = srtToAss(captions);
    writeFileSync(subsPath, assContent);
    console.log('ASS content created successfully');

    // Check if FFmpeg is available
    let processedBuffer;
    let ffmpegAvailable = true;
    try {
      // Configure FFmpeg for video processing with captions (optimized for Supabase)
      let ffmpegCommand = ffmpeg(inputPath).outputOptions([
        '-c:v',
        'libx264',
        '-preset',
        'fast',
        '-crf',
        '28', // Higher CRF for better compression (was 23)
        '-c:a',
        'aac',
        '-b:a',
        '96k', // Lower audio bitrate (was 128k)
        '-movflags',
        '+faststart', // Optimize for web streaming
        '-profile:v',
        'baseline', // Use baseline profile for better compatibility
      ]);

      // Apply cropping based on mode - proper 9:16 cropping
      let videoFilter = '';
      switch (mode) {
        case 'pad-9x16':
          // For pad mode, actually crop to 9:16 instead of just padding
          videoFilter = 'crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920';
          break;
        case 'crop-center-9x16':
          // Crop from center to 9:16 ratio
          videoFilter = 'crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920';
          break;
        case 'crop-top-9x16':
          // Crop from top to 9:16 ratio
          videoFilter = 'crop=ih*9/16:ih:0:0,scale=1080:1920';
          break;
        case 'crop-bottom-9x16':
          // Crop from bottom to 9:16 ratio
          videoFilter = 'crop=ih*9/16:ih:iw-ih*9/16:0,scale=1080:1920';
          break;
        default:
          // Default to center crop
          videoFilter = 'crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920';
      }

      // Use subtitles filter with proper escaping
      const subsPathEscaped = subsPath.replace(/\\/g, '/').replace(/:/g, '\\:');
      let finalVideoFilter = videoFilter;
      if (captions) {
        finalVideoFilter += `,subtitles='${subsPathEscaped}':force_style='FontSize=36,Outline=2'`;
      }

      ffmpegCommand = ffmpegCommand.outputOptions(['-vf', finalVideoFilter]);

      console.log('Base video filter:', videoFilter);
      console.log('Final video filter with subtitles:', finalVideoFilter);
      console.log('Subs path: Available');
      console.log('ASS file exists:', existsSync(subsPath));

      // Process video
      await new Promise((resolve, reject) => {
        ffmpegCommand
          .output(outputPath)
          .on('start', (commandLine) => {
            console.log('FFmpeg command: Processing video...');
          })
          .on('progress', (progress) => {
            console.log('Processing progress:', progress.percent + '%');
          })
          .on('end', () => {
            console.log('Video processing with captions completed');
            resolve();
          })
          .on('error', (err, stdout, stderr) => {
            console.error('FFmpeg error during processing:', err.message);
            reject(err);
          })
          .run();
      });

      processedBuffer = readFileSync(outputPath);

      // Verify output video dimensions with ffprobe
      try {
        await new Promise((resolve, reject) => {
          ffmpeg.ffprobe(outputPath, (err, info) => {
            if (!err) {
              const videoStream = info.streams.find(
                (s) => s.codec_type === 'video'
              );
              if (videoStream) {
                console.log(
                  'OUTPUT VIDEO DIMENSIONS:',
                  videoStream.width,
                  'x',
                  videoStream.height
                );
                console.log('Expected: 1080 x 1920 (9:16)');
                if (videoStream.width === 1080 && videoStream.height === 1920) {
                  console.log('✅ Video dimensions are correct!');
                } else {
                  console.log('⚠️ Video dimensions are not as expected');
                }
              }
            } else {
              console.log('Could not probe output video');
            }
            resolve();
          });
        });
      } catch (probeError) {
        console.log('FFprobe error: Could not probe video');
      }
    } catch (ffmpegError) {
      console.error('FFmpeg error:', ffmpegError);
      console.log('FFmpeg not available, returning original video with note');
      ffmpegAvailable = false;
      processedBuffer = Buffer.from(videoBuffer); // Fallback to original video
    }

    // Return the processed video directly (bypassing Supabase for local development)
    const fileName = generateVideoFileName('processed');

    // Set appropriate headers for video response
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Length', (processedBuffer || videoBuffer).length);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Send the processed video directly
    res.send(processedBuffer || videoBuffer);
  } catch (error) {
    console.error('Video processing error:', error);
    res
      .status(500)
      .json({ error: 'Failed to process video', details: error.message });
  } finally {
    await cleanupTempFiles(inputPath, outputPath, subsPath);
  }
});

// Captions generation endpoint (with optional TikTok cropping)
app.post('/captions', async (req, res) => {
  let inputPath = null;
  let outputPath = null;

  try {
    const {
      mp4Url,
      language = 'en',
      cropToTikTok = false,
      mode = 'crop-center-9x16',
    } = req.body;

    // Validate input
    if (!mp4Url) {
      return res.status(400).json({ error: 'mp4Url is required' });
    }

    if (!mp4Url.endsWith('.mp4')) {
      return res.status(400).json({ error: 'URL must end with .mp4' });
    }

    if (!mp4Url.startsWith('http')) {
      return res
        .status(400)
        .json({ error: 'URL must be a valid HTTP/HTTPS link' });
    }

    // Check for OpenAI API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    console.log(`Processing captions for: ${mp4Url}`);

    // Download the video file
    const videoResponse = await fetch(mp4Url);
    if (!videoResponse.ok) {
      throw new Error(
        `Failed to download video: ${videoResponse.status} ${videoResponse.statusText}`
      );
    }

    const videoBuffer = await videoResponse.arrayBuffer();

    // If cropToTikTok is enabled, crop the video first to reduce file size
    let finalVideoBuffer = videoBuffer;

    if (cropToTikTok) {
      console.log('Cropping video to TikTok format for captions...');

      try {
        // Create temporary files
        const timestamp = Date.now();
        inputPath = join(process.cwd(), `temp_captions_input_${timestamp}.mp4`);
        outputPath = join(
          process.cwd(),
          `temp_captions_output_${timestamp}.mp4`
        );

        // Write input file
        writeFileSync(inputPath, Buffer.from(videoBuffer));

        // Configure FFmpeg for TikTok cropping
        let ffmpegCommand = ffmpeg(inputPath).outputOptions([
          '-c:v',
          'libx264',
          '-preset',
          'fast',
          '-crf',
          '28', // Higher CRF for smaller file size
          '-c:a',
          'aac',
          '-b:a',
          '64k', // Lower audio bitrate for smaller file size
        ]);

        // Apply cropping based on mode
        switch (mode) {
          case 'pad-9x16':
            ffmpegCommand = ffmpegCommand.outputOptions([
              '-vf',
              'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black',
            ]);
            break;
          case 'crop-center-9x16':
            ffmpegCommand = ffmpegCommand.outputOptions([
              '-vf',
              'crop=ih*9/16:ih:(iw-ih*9/16)/2:0',
            ]);
            break;
          case 'crop-top-9x16':
            ffmpegCommand = ffmpegCommand.outputOptions([
              '-vf',
              'crop=ih*9/16:ih:0:0',
            ]);
            break;
          case 'crop-bottom-9x16':
            ffmpegCommand = ffmpegCommand.outputOptions([
              '-vf',
              'crop=ih*9/16:ih:iw-ih*9/16:0',
            ]);
            break;
          default:
            ffmpegCommand = ffmpegCommand.outputOptions([
              '-vf',
              'crop=ih*9/16:ih:(iw-ih*9/16)/2:0',
            ]);
        }

        // Process video
        await new Promise((resolve, reject) => {
          ffmpegCommand
            .output(outputPath)
            .on('end', () => {
              console.log('Video cropping for captions completed');
              resolve();
            })
            .on('error', (err) => {
              console.error('FFmpeg error during cropping:', err);
              reject(err);
            })
            .run();
        });

        // Read the processed video
        finalVideoBuffer = readFileSync(outputPath);

        // Clean up temporary files
        try {
          unlinkSync(inputPath);
          unlinkSync(outputPath);
          inputPath = null;
          outputPath = null;
        } catch (cleanupError) {
          console.warn('Failed to clean up temp files');
        }
      } catch (ffmpegError) {
        console.log('FFmpeg not available for captions, using original video');
        // If FFmpeg fails, use the original video
        finalVideoBuffer = videoBuffer;
      }
    }

    // Check final file size (limit to 25MB for Whisper API)
    if (finalVideoBuffer.length > 25 * 1024 * 1024) {
      console.log(
        `Video too large for captions: ${Math.round(
          finalVideoBuffer.length / 1024 / 1024
        )}MB`
      );

      // Try one more aggressive compression if FFmpeg is available
      if (cropToTikTok) {
        try {
          console.log('Attempting aggressive compression for captions...');
          const timestamp = Date.now();
          const aggressiveInputPath = join(
            process.cwd(),
            `temp_aggressive_input_${timestamp}.mp4`
          );
          const aggressiveOutputPath = join(
            process.cwd(),
            `temp_aggressive_output_${timestamp}.mp4`
          );

          writeFileSync(aggressiveInputPath, Buffer.from(finalVideoBuffer));

          // Very aggressive compression settings
          await new Promise((resolve, reject) => {
            ffmpeg(aggressiveInputPath)
              .outputOptions([
                '-c:v',
                'libx264',
                '-preset',
                'ultrafast',
                '-crf',
                '35', // Very high compression
                '-c:a',
                'aac',
                '-b:a',
                '32k', // Very low audio bitrate
                '-vf',
                'scale=720:1280', // Force smaller resolution
              ])
              .output(aggressiveOutputPath)
              .on('end', () => {
                console.log('Aggressive compression completed');
                resolve();
              })
              .on('error', (err) => {
                console.error('Aggressive compression failed:', err);
                reject(err);
              })
              .run();
          });

          const compressedBuffer = readFileSync(aggressiveOutputPath);

          // Clean up
          try {
            unlinkSync(aggressiveInputPath);
            unlinkSync(aggressiveOutputPath);
          } catch (cleanupError) {
            console.warn('Failed to clean up aggressive compression files');
          }

          // Check if compression helped
          if (compressedBuffer.length <= 25 * 1024 * 1024) {
            console.log(
              `Compression successful: ${Math.round(
                compressedBuffer.length / 1024 / 1024
              )}MB`
            );
            finalVideoBuffer = compressedBuffer;
          } else {
            console.log(
              `Still too large after compression: ${Math.round(
                compressedBuffer.length / 1024 / 1024
              )}MB`
            );
            return res.status(400).json({
              error: 'Video file too large (max 25MB for captions)',
              suggestion:
                'Try a shorter video or install FFmpeg for better compression',
            });
          }
        } catch (compressionError) {
          console.log('Aggressive compression failed, skipping captions');
          return res.status(400).json({
            error: 'Video file too large (max 25MB for captions)',
            suggestion:
              'This video is too large for caption generation. Try using the test video: https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4 or install FFmpeg for better compression.',
          });
        }
      } else {
        return res.status(400).json({
          error: 'Video file too large (max 25MB for captions)',
          suggestion:
            'This video is too large for caption generation. Try using the test video: https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4 or enable TikTok cropping to reduce file size.',
        });
      }
    }

    const videoFile = new File([finalVideoBuffer], 'video.mp4', {
      type: 'video/mp4',
    });

    // Prepare form data for OpenAI API
    const formData = new FormData();
    formData.append('file', videoFile);
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'srt');
    formData.append('language', language);

    // Call OpenAI Whisper API
    const openaiResponse = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      }
    );

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(
        `OpenAI API error: ${openaiResponse.status} ${errorText}`
      );
    }

    const srtContent = await openaiResponse.text();

    console.log('Captions generated successfully');

    // Return SRT content as plain text
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(srtContent);
  } catch (error) {
    console.error('Captions generation error:', error);

    // Clean up temporary files on error
    try {
      if (inputPath) unlinkSync(inputPath);
      if (outputPath) unlinkSync(outputPath);
    } catch (cleanupError) {
      console.warn('Failed to clean up temp files');
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Helper to clean up temporary files
async function cleanupTempFiles(...paths) {
  for (const path of paths) {
    if (path) {
      try {
        unlinkSync(path);
      } catch (error) {
        if (error.code === 'ENOENT') {
          // File already deleted or never created, ignore
        } else {
          console.warn('Failed to clean up temp files');
        }
      }
    }
  }
}

// Helper to convert SRT to ASS format
function srtToAss(srt) {
  const assHeader = `[Script Info]
; Script generated by Klipit Pump Pulse
PlayResX=1080
PlayResY=1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Inter,36,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,0,2,0,0,60,1`;

  const assEventsHeader = `\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`;

  const assEvents = srt
    .split('\n\n')
    .map((block) => {
      const lines = block.split('\n').filter((line) => line.trim() !== '');
      if (lines.length < 3) {
        console.log('Skipping malformed SRT block');
        return '';
      }

      // Find the timestamp line (should be the second line after the number)
      let timestampLine = '';
      let textLines = [];

      for (let i = 1; i < lines.length; i++) {
        if (lines[i].includes(' --> ')) {
          timestampLine = lines[i];
          textLines = lines.slice(i + 1);
          break;
        }
      }

      if (!timestampLine) {
        console.log('No timestamp found in block');
        return '';
      }

      // Convert SRT timestamp HH:MM:SS,ms to ASS H:MM:SS.cs
      const convertTimestamp = (srtTime) => {
        if (!srtTime || typeof srtTime !== 'string') {
          console.error('Invalid timestamp');
          return '0:00:00.00';
        }

        const [time, ms] = srtTime.split(',');
        if (!time || !ms) {
          console.error('Invalid timestamp format');
          return '0:00:00.00';
        }

        const timeParts = time.split(':');
        if (timeParts.length !== 3) {
          console.error('Invalid time format');
          return '0:00:00.00';
        }

        const [h, m, s] = timeParts.map(Number);
        const cs = Math.floor(Number(ms) / 10); // centiseconds
        return `${h}:${m.toString().padStart(2, '0')}:${s
          .toString()
          .padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
      };

      const [startSrt, endSrt] = timestampLine
        .split(' --> ')
        .map((s) => s.trim());
      const startTime = convertTimestamp(startSrt);
      const endTime = convertTimestamp(endSrt);

      const text = textLines.join('\\N'); // Join multi-line captions with \N

      return `Dialogue: 0,${startTime},${endTime},Default,,0,0,0,,${text}`;
    })
    .filter(Boolean)
    .join('\n');

  return `${assHeader}${assEventsHeader}\n${assEvents}`;
}

// Helper to parse ASS file and create drawtext filters
function parseAssToDrawtext(assContent) {
  const lines = assContent.split('\n');
  const drawtextFilters = [];

  // Find the Events section
  let inEvents = false;
  for (const line of lines) {
    if (line.trim() === '[Events]') {
      inEvents = true;
      continue;
    }

    if (inEvents && line.startsWith('Dialogue:')) {
      // Parse dialogue line: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
      const parts = line.split(',');
      if (parts.length >= 10) {
        const startTime = parts[1].trim();
        const endTime = parts[2].trim();
        const text = parts.slice(9).join(',').trim();

        // Convert ASS time format (H:MM:SS.cs) to seconds
        const startSeconds = assTimeToSeconds(startTime);
        const endSeconds = assTimeToSeconds(endTime);

        // Create drawtext filter
        const drawtextFilter = `drawtext=text='${text.replace(
          /'/g,
          "\\'"
        )}':fontsize=36:fontcolor=white:x=(w-text_w)/2:y=h-th-50:box=1:boxcolor=black@0.5:enable='between(t,${startSeconds},${endSeconds})'`;
        drawtextFilters.push(drawtextFilter);
      }
    }
  }

  return drawtextFilters;
}

// Helper to convert ASS time format to seconds
function assTimeToSeconds(timeStr) {
  // Format: H:MM:SS.cs (e.g., "0:00:15.80")
  const parts = timeStr.split(':');
  if (parts.length === 3) {
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    const seconds = parseFloat(parts[2]);
    return hours * 3600 + minutes * 60 + seconds;
  }
  return 0;
}

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Captions server running on port', PORT);
  console.log(
    '🔑 OpenAI API key:',
    process.env.OPENAI_API_KEY ? 'Configured' : 'Missing'
  );
  console.log('🌐 Server accessible at: http://0.0.0.0:' + PORT);
  console.log('✅ Server is ready to accept requests');
});

// Keep server alive
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  // Don't exit immediately, try to recover
  setTimeout(() => {
    console.log('Attempting to restart server...');
    process.exit(1);
  }, 1000);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error.message);
  // Continue running instead of exiting
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  // Continue running instead of exiting
});

// Graceful shutdown - but try to stay alive
process.on('SIGTERM', () => {
  console.log('SIGTERM received - attempting to stay alive...');
  // Don't exit immediately, try to continue
  setTimeout(() => {
    console.log('SIGTERM: Shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  }, 5000); // Wait 5 seconds before actually shutting down
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Keep the process alive and respond to Railway
setInterval(() => {
  // Log every 30 seconds to show server is alive
  console.log(`💓 Server heartbeat: ${new Date().toISOString()}`);
}, 30000); // Every 30 seconds
