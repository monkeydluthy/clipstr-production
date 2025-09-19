import React, { useState } from 'react';
import { PixelButton } from '@/components/ui/pixel-button';
import {
  PixelCard,
  PixelCardContent,
  PixelCardHeader,
  PixelCardTitle,
} from '@/components/ui/pixel-card';
import { PixelInput } from '@/components/ui/pixel-input';
import { PixelProgress } from '@/components/ui/pixel-progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useVideoProcessingStore } from '@/lib/store';
import { srtToAss } from '@/lib/srtToAss';
import { Sparkles, Download, AlertCircle } from 'lucide-react';

type ProcessingMode =
  | 'pad-9x16'
  | 'crop-center-9x16'
  | 'crop-top-9x16'
  | 'crop-bottom-9x16';

const ClipForm: React.FC = () => {
  // Base URL for API calls - handle different deployment environments
  const isNetlify = window.location.hostname.includes('netlify.app');
  const isLocalDev = window.location.hostname.includes('localhost');
  const isProduction =
    window.location.hostname.includes('clipstr.fun') ||
    window.location.hostname.includes('your-domain.com');

  const baseUrl = isNetlify
    ? '' // Netlify functions use relative URLs
    : isLocalDev
    ? (import.meta.env.VITE_CAPTIONS_URL || 'http://localhost:8787').replace(
        /\/+$/,
        ''
      )
    : isProduction
    ? '' // Production uses same domain, so relative URLs work
    : (import.meta.env.VITE_CAPTIONS_URL || '').replace(/\/+$/, ''); // Fallback to env var

  const [mp4Url, setMp4Url] = useState('');
  const [mode, setMode] = useState<ProcessingMode>('crop-center-9x16');
  const [autoCaptions, setAutoCaptions] = useState(true);
  const [ffmpeg, setFfmpeg] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const { toast } = useToast();
  const {
    isProcessing,
    progress,
    progressText,
    setProcessing,
    setProgress,
    setProcessedVideo,
    setError,
    reset,
  } = useVideoProcessingStore();

  const initializeFFmpeg = async () => {
    if (ffmpeg) return ffmpeg;

    setIsInitializing(true);
    try {
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const { toBlobURL } = await import('@ffmpeg/util');

      const ffmpegInstance = new FFmpeg();

      // Load FFmpeg with correct URLs - try different version
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/esm';

      // Add timeout to prevent hanging
      const loadPromise = ffmpegInstance.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          'text/javascript'
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          'application/wasm'
        ),
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('FFmpeg initialization timeout')),
          30000
        )
      );

      await Promise.race([loadPromise, timeoutPromise]);

      setFfmpeg(ffmpegInstance);
      return ffmpegInstance;
    } catch (error) {
      console.error('Failed to initialize FFmpeg:', error);
      setError(
        'Failed to initialize video processor. This might be due to browser compatibility issues. Please try refreshing the page.'
      );
      throw error;
    } finally {
      setIsInitializing(false);
    }
  };

  const validateMp4Url = (url: string): boolean => {
    return url.trim().endsWith('.mp4') && url.includes('http');
  };

  const downloadVideo = async (url: string): Promise<ArrayBuffer> => {
    console.log('Starting progressive video download...');

    try {
      // Strategy 1: Try direct fetch (works for some URLs)
      console.log('Strategy 1: Trying direct fetch...');
      const directResult = await tryDirectFetch(url);
      if (directResult) {
        console.log('Direct fetch successful!');
        return directResult;
      }
    } catch (error) {
      console.log('Direct fetch failed:', error.message);
    }

    try {
      // Strategy 2: Try CORS proxy services
      console.log('Strategy 2: Trying CORS proxy services...');
      const proxyResult = await tryProxyFetch(url);
      if (proxyResult) {
        console.log('Proxy fetch successful!');
        return proxyResult;
      }
    } catch (error) {
      console.log('Proxy fetch failed:', error.message);
    }

    try {
      // Strategy 3: Try Netlify function (only for smaller videos)
      console.log('Strategy 3: Trying Netlify function...');
      const netlifyResult = await tryNetlifyFunction(url);
      if (netlifyResult) {
        console.log('Netlify function successful!');
        return netlifyResult;
      }
    } catch (error) {
      console.log('Netlify function failed:', error.message);
    }

    // Strategy 4: Fallback - throw error
    throw new Error('All download strategies failed');
  };

  const tryDirectFetch = async (
    videoUrl: string
  ): Promise<ArrayBuffer | null> => {
    try {
      const response = await fetch(videoUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          Accept: 'video/mp4,video/*,*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      if (response.ok) {
        return await response.arrayBuffer();
      }
    } catch (error) {
      // CORS error or other fetch error
    }
    return null;
  };

  const tryProxyFetch = async (
    videoUrl: string
  ): Promise<ArrayBuffer | null> => {
    const proxies = [
      'https://api.allorigins.win/raw?url=',
      'https://api.codetabs.com/v1/proxy?quest=',
      'https://cors-anywhere.herokuapp.com/',
      'https://thingproxy.freeboard.io/fetch/',
    ];

    for (const proxy of proxies) {
      try {
        console.log(`Trying proxy: ${proxy}`);
        const response = await fetch(proxy + encodeURIComponent(videoUrl), {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        if (response.ok) {
          console.log('Proxy successful:', proxy);
          return await response.arrayBuffer();
        }
      } catch (error) {
        console.log(`Proxy failed: ${proxy}`, error.message);
        continue;
      }
    }

    return null;
  };

  const tryNetlifyFunction = async (
    videoUrl: string
  ): Promise<ArrayBuffer | null> => {
    try {
      const downloadUrl = isNetlify
        ? '/.netlify/functions/proxy-video'
        : `${baseUrl}/download`;

      const response = await fetch(downloadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl: videoUrl }),
      });

      if (response.ok) {
        return await response.arrayBuffer();
      }
    } catch (error) {
      console.log('Netlify function error:', error.message);
    }
    return null;
  };

  const cropToTikTok = async (
    url: string,
    mode: ProcessingMode
  ): Promise<{ buffer: ArrayBuffer; ffmpegAvailable: boolean }> => {
    console.log('Cropping video to TikTok format with client-side FFmpeg:', {
      url,
      mode,
    });

    const ffmpegInstance = await initializeFFmpeg();
    if (!ffmpegInstance) {
      throw new Error('FFmpeg not available');
    }

    // Download the video using proxy to handle CORS
    const videoData = await downloadVideo(url);

    // Write video to FFmpeg filesystem
    await ffmpegInstance.writeFile('input.mp4', new Uint8Array(videoData));

    // Build FFmpeg filter for cropping
    const videoFilter = buildFFmpegFilter(mode, false);

    // Determine compression settings based on mode
    const isCompressed = mode.includes('compressed');
    const crf = isCompressed ? '28' : '23'; // Higher CRF = more compression
    const preset = isCompressed ? 'ultrafast' : 'fast';
    const audioBitrate = isCompressed ? '96k' : '128k';

    console.log('FFmpeg compression settings:', {
      crf,
      preset,
      audioBitrate,
      isCompressed,
    });

    // Run FFmpeg command with appropriate compression
    await ffmpegInstance.exec([
      '-i',
      'input.mp4',
      '-vf',
      videoFilter,
      '-c:v',
      'libx264',
      '-preset',
      preset,
      '-crf',
      crf,
      '-c:a',
      'aac',
      '-b:a',
      audioBitrate,
      'output.mp4',
    ]);

    // Read the output
    const outputData = await ffmpegInstance.readFile('output.mp4');

    // Clean up files
    await ffmpegInstance.deleteFile('input.mp4');
    await ffmpegInstance.deleteFile('output.mp4');

    console.log('Crop successful:', {
      bufferSize: outputData.length,
      compressed: isCompressed,
    });

    return { buffer: outputData.buffer, ffmpegAvailable: true };
  };

  const generateCaptions = async (videoUrl: string): Promise<string> => {
    const captionsUrl = isNetlify
      ? '/.netlify/functions/captions'
      : `${baseUrl}/captions`;

    if (!captionsUrl) {
      throw new Error('Captions service not configured');
    }

    const response = await fetch(captionsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mp4Url: videoUrl,
        language: 'en',
        cropToTikTok: isNetlify ? false : true, // Disable cropping for Netlify functions
        mode: mode,
      }),
    });

    console.log('Captions response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Captions error:', errorData);
      throw new Error(
        `Captions generation failed: ${response.status} ${
          errorData.error || response.statusText
        }`
      );
    }

    const srtCaptions = await response.text();
    console.log(
      'Captions generated successfully:',
      srtCaptions.length,
      'characters'
    );

    return srtCaptions;
  };

  const buildFFmpegFilter = (
    mode: ProcessingMode,
    hasCaptions: boolean
  ): string => {
    let videoFilter = '';

    switch (mode) {
      case 'pad-9x16':
        videoFilter = 'scale=1080:-2,pad=1080:1920:(ow-iw)/2:(oh-ih)/2';
        break;
      case 'crop-center-9x16':
        videoFilter = 'crop=iw:ih*9/16:(iw-iw)/2:(ih-ih*9/16)/2,scale=1080:-2';
        break;
      case 'crop-top-9x16':
        videoFilter = 'crop=iw:ih*9/16:(iw-iw)/2:0,scale=1080:-2';
        break;
      case 'crop-bottom-9x16':
        videoFilter = 'crop=iw:ih*9/16:(iw-iw)/2:(ih-ih*9/16),scale=1080:-2';
        break;
    }

    if (hasCaptions) {
      videoFilter += `,subtitles=subs.ass:force_style='Outline=2,BorderStyle=4,Fontsize=36'`;
    }

    return videoFilter;
  };

  const processVideoWithCaptions = async (
    url: string,
    srtCaptions: string,
    mode: ProcessingMode
  ): Promise<{ buffer: ArrayBuffer; ffmpegAvailable: boolean }> => {
    console.log('Processing video with captions using client-side FFmpeg:', {
      url,
      mode,
    });

    const ffmpegInstance = await initializeFFmpeg();
    if (!ffmpegInstance) {
      throw new Error('FFmpeg not available');
    }

    // Download the video using proxy to handle CORS
    const videoData = await downloadVideo(url);

    // Convert SRT to ASS format for better styling
    const assCaptions = srtToAss(srtCaptions);

    // Write files to FFmpeg filesystem
    await ffmpegInstance.writeFile('input.mp4', new Uint8Array(videoData));
    await ffmpegInstance.writeFile('captions.ass', assCaptions);

    // Build FFmpeg filter for video processing and captions
    const videoFilter = buildFFmpegFilter(mode, true);

    // Run FFmpeg command with captions
    await ffmpegInstance.exec([
      '-i',
      'input.mp4',
      '-vf',
      videoFilter,
      '-c:v',
      'libx264',
      '-preset',
      'fast',
      '-crf',
      '23',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      'output.mp4',
    ]);

    // Read the output
    const outputData = await ffmpegInstance.readFile('output.mp4');

    // Clean up files
    await ffmpegInstance.deleteFile('input.mp4');
    await ffmpegInstance.deleteFile('captions.ass');
    await ffmpegInstance.deleteFile('output.mp4');

    console.log('Video processing successful:', {
      bufferSize: outputData.length,
    });

    return { buffer: outputData.buffer, ffmpegAvailable: true };
  };

  const processVideo = async () => {
    if (!mp4Url.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid MP4 URL',
        variant: 'destructive',
      });
      return;
    }

    if (!validateMp4Url(mp4Url)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid MP4 URL ending with .mp4',
        variant: 'destructive',
      });
      return;
    }

    try {
      reset();
      setProcessing(true);
      setProgress(0, 'Testing captions generation...');

      // Skip captions on Netlify to focus on video processing
      let captions: string | null = null;
      if (autoCaptions && !isNetlify) {
        try {
          setProgress(20, 'Generating captions...');
          const srtContent = await generateCaptions(mp4Url);
          console.log('Captions generated:', srtContent);
          setProgress(50, 'Captions generated successfully!');

          // Store captions for later use
          captions = srtContent;
        } catch (error) {
          console.warn('Captions generation failed:', error);

          // Check if it's a file size error
          const errorMessage = error.message || '';
          if (
            errorMessage.includes('too large') ||
            errorMessage.includes('413')
          ) {
            toast({
              title: 'Video Too Large for Captions',
              description:
                'This video is too large for caption generation (max 25MB). Video processing will continue without captions.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Warning',
              description:
                'Failed to generate captions. Video processing will continue without captions.',
              variant: 'destructive',
            });
          }
        }
      } else if (isNetlify) {
        console.log(
          'Skipping captions on Netlify - focusing on video processing'
        );
        setProgress(30, 'Processing video (Netlify mode)...');
      }

      // Process video with captions and TikTok cropping
      try {
        setProgress(30, 'Processing video...');

        let finalVideoBuffer: ArrayBuffer;

        console.log('Processing video with captions:', {
          autoCaptions,
          hasCaptions: !!captions,
          captionsLength: captions?.length,
        });

        if (autoCaptions && captions) {
          if (isNetlify) {
            // For Netlify, just use the original video (captions not supported)
            setProgress(
              40,
              'Preparing video for Netlify (captions not supported)...'
            );

            console.log(
              'Using original video for Netlify (captions not supported):',
              mp4Url
            );

            try {
              const videoResponse = await fetch(mp4Url);
              if (!videoResponse.ok) {
                throw new Error(
                  `Failed to download video: ${videoResponse.status} ${videoResponse.statusText}`
                );
              }

              finalVideoBuffer = await videoResponse.arrayBuffer();
              console.log(
                'Video downloaded directly in browser (no captions):',
                {
                  bufferSize: finalVideoBuffer.byteLength,
                  note: 'Original video (captions not supported on Netlify)',
                }
              );

              toast({
                title: 'Video Ready (Netlify Mode)',
                description:
                  'Video is ready! Note: Captions are not supported on Netlify. Use local development for full video processing with captions.',
                variant: 'default',
              });
            } catch (error) {
              console.error('Failed to download video directly:', error);
              throw new Error(`Failed to download video: ${error.message}`);
            }
          } else {
            // Local server processing with captions
            setProgress(40, 'Burning captions into video...');
            const processUrl = `${baseUrl}/process-video`;
            const response = await fetch(processUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                mp4Url: mp4Url,
                mode: mode,
                captions: captions,
              }),
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(
                `Video processing failed: ${
                  errorData.error || response.statusText
                }`
              );
            }

            // Server now returns the processed video directly
            console.log('Video with captions processed successfully');
            finalVideoBuffer = await response.arrayBuffer();
          }
        } else {
          if (isNetlify) {
            // For Netlify, use the function as a CORS proxy to download the video
            setProgress(40, 'Downloading video via Netlify proxy...');

            console.log(
              'Using Netlify function as CORS proxy for video:',
              mp4Url
            );

            // Call Netlify function to get the video file
            const cropUrl = '/.netlify/functions/crop-tiktok';
            const response = await fetch(cropUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ mp4Url: mp4Url, mode }),
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(
                `Netlify function failed: ${
                  errorData.error || response.statusText
                }`
              );
            }

            // Get the video file from the response
            const videoBuffer = await response.arrayBuffer();
            console.log('Video downloaded via Netlify proxy:', {
              bufferSize: videoBuffer.byteLength,
            });

            // Process with client-side FFmpeg for cropping and compression
            setProgress(60, 'Processing video with client-side FFmpeg...');

            try {
              // Create a blob URL for the video
              const videoBlob = new Blob([videoBuffer], { type: 'video/mp4' });
              const videoUrl = URL.createObjectURL(videoBlob);

              // Determine if compression is needed based on file size
              const needsCompression =
                videoBuffer.byteLength > 25 * 1024 * 1024; // 25MB
              const processingMode = needsCompression
                ? 'crop-center-9x16-compressed'
                : mode;

              console.log('Processing with client-side FFmpeg:', {
                needsCompression,
                processingMode,
                originalSize: videoBuffer.byteLength,
              });

              // Process with client-side FFmpeg
              const cropResult = await cropToTikTok(videoUrl, processingMode);
              finalVideoBuffer = cropResult.buffer;

              // Clean up the blob URL
              URL.revokeObjectURL(videoUrl);

              console.log('Client-side FFmpeg processing completed:', {
                bufferSize: finalVideoBuffer.byteLength,
                compressed: needsCompression,
              });

              toast({
                title: 'Video Ready!',
                description: needsCompression
                  ? 'Video processed with compression and cropping! Full functionality working on Netlify.'
                  : 'Video processed with client-side FFmpeg! Full cropping functionality working on Netlify.',
                variant: 'default',
              });
            } catch (error) {
              console.error('Client-side FFmpeg processing failed:', error);
              // Fallback to original video if FFmpeg fails
              finalVideoBuffer = videoBuffer;

              toast({
                title: 'Video Ready (Fallback Mode)',
                description:
                  'Video is ready! Note: FFmpeg processing failed, showing original video.',
                variant: 'default',
              });
            }
          } else {
            // Local server processing with FFmpeg
            setProgress(40, 'Cropping to TikTok format...');
            const cropUrl = `${baseUrl}/crop-tiktok`;
            const response = await fetch(cropUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ mp4Url: mp4Url, mode }),
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(
                `TikTok cropping failed: ${
                  errorData.error || response.statusText
                }`
              );
            }

            // Server now returns the processed video directly
            console.log('Local video cropping completed successfully');
            finalVideoBuffer = await response.arrayBuffer();
          }
        }

        setProgress(80, 'Creating preview...');

        console.log('Final video buffer size:', finalVideoBuffer.byteLength);
        console.log(
          'Final video buffer first 100 bytes:',
          new Uint8Array(finalVideoBuffer.slice(0, 100))
        );

        // Create a preview with the processed video
        const blob = new Blob([finalVideoBuffer], { type: 'video/mp4' });
        const videoUrl = URL.createObjectURL(blob);

        console.log('Video preview created:', videoUrl);
        console.log('Blob size:', blob.size);
        console.log('Blob type:', blob.type);
        console.log('Setting processed video URL in store:', videoUrl);

        // Additional debugging - check if the blob is valid
        console.log(
          'Blob URL created successfully:',
          videoUrl.startsWith('blob:')
        );
        console.log('Blob size in MB:', (blob.size / 1024 / 1024).toFixed(2));

        // Test if the video can be loaded
        const testVideo = document.createElement('video');
        testVideo.onloadedmetadata = () => {
          console.log('Video metadata loaded successfully:');
          console.log('- Video width:', testVideo.videoWidth);
          console.log('- Video height:', testVideo.videoHeight);
          console.log('- Video duration:', testVideo.duration);
          console.log('- Expected dimensions: 1080x1920 (9:16)');
          if (testVideo.videoWidth === 1080 && testVideo.videoHeight === 1920) {
            console.log('✅ Video dimensions are correct!');
          } else {
            console.log('⚠️ Video dimensions are not as expected');
          }
        };
        testVideo.onerror = (e) => {
          console.error('Video failed to load:', e);
        };
        testVideo.src = videoUrl;

        setProcessedVideo(videoUrl);
        setProgress(100, 'TikTok video ready!');

        toast({
          title: 'TikTok Video Ready!',
          description:
            autoCaptions && captions
              ? `Video processed with captions and cropped to 9:16 format using ${mode} mode.`
              : `Video cropped to 9:16 format using ${mode} mode.`,
        });
      } catch (cropError) {
        console.error('TikTok cropping failed:', cropError);
        setError(
          'TikTok cropping failed. This might be due to network issues or the video URL not being accessible.'
        );

        toast({
          title: 'Cropping Failed',
          description:
            'Could not crop the video to TikTok format. Please check the URL and try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Video processing failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  console.log('ClipForm rendering, mp4Url:', mp4Url);

  return (
    <div className="card-elegant p-8 space-y-8">
      <div className="space-y-6">
        <div>
          <h2 className="font-semibold text-xl mb-4">Process Video</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="mp4-url" className="font-medium text-foreground">
                Video URL
              </Label>
              <input
                id="mp4-url"
                type="url"
                placeholder="https://example.com/video.mp4"
                value={mp4Url}
                onChange={(e) => setMp4Url(e.target.value)}
                className="input-elegant w-full mt-2"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Enter a direct link to your video file
              </p>
              <p className="text-sm text-amber-500 mt-1 flex items-center gap-1">
                ⚠️ Large videos (&gt;25MB) will be cropped to TikTok format but
                captions may be skipped
              </p>
            </div>

            <div>
              <Label htmlFor="mode" className="font-medium text-foreground">
                Processing Mode
              </Label>
              <Select
                value={mode}
                onValueChange={(value: ProcessingMode) => setMode(value)}
              >
                <SelectTrigger className="input-elegant w-full mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pad-9x16">
                    📱 Pad to 9:16 (Safe)
                  </SelectItem>
                  <SelectItem value="crop-center-9x16">
                    ✂️ Crop Center to 9:16 (TikTok style)
                  </SelectItem>
                  <SelectItem value="crop-top-9x16">
                    ⬆️ Crop Top to 9:16 (focus on top)
                  </SelectItem>
                  <SelectItem value="crop-bottom-9x16">
                    ⬇️ Crop Bottom to 9:16 (focus on bottom)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-3">
              <Switch
                id="auto-captions"
                checked={autoCaptions}
                onCheckedChange={setAutoCaptions}
              />
              <Label
                htmlFor="auto-captions"
                className="font-medium text-foreground"
              >
                Auto captions
              </Label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={processVideo}
            disabled={!mp4Url.trim() || isProcessing || isInitializing}
            className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-lg font-semibold"
          >
            {isInitializing ? (
              <>
                <Download className="w-5 h-5 animate-spin" />
                Initializing...
              </>
            ) : isProcessing ? (
              <>
                <Sparkles className="w-5 h-5 animate-pulse" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                🎬 Create TikTok Video
              </>
            )}
          </button>

          {isInitializing && (
            <button
              onClick={() => {
                setError(
                  'Video processing skipped. FFmpeg initialization failed.'
                );
                setIsInitializing(false);
              }}
              className="btn-secondary w-full"
            >
              Skip Video Processing
            </button>
          )}
        </div>

        {isProcessing && (
          <div className="space-y-2">
            <PixelProgress value={progress} />
            <p className="font-pixel text-sm text-center">{progressText}</p>
          </div>
        )}

        {useVideoProcessingStore.getState().error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <p className="text-sm text-destructive">
              {useVideoProcessingStore.getState().error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClipForm;
