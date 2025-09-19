const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  console.log('Crop-tiktok function called');

  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    console.log('Parsing request body...');
    const { mp4Url, mode = 'crop-center-9x16' } = JSON.parse(event.body);

    if (!mp4Url) {
      console.log('No mp4Url provided');
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'mp4Url is required' }),
      };
    }

    console.log('Processing video for TikTok format:', mp4Url);

    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Download video to Supabase Storage for processing
    try {
      console.log('Downloading video to Supabase Storage...');

      // Download the video
      const videoResponse = await fetch(mp4Url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          Accept: 'video/mp4,video/*,*/*',
        },
      });

      if (!videoResponse.ok) {
        throw new Error(
          `Failed to download video: ${videoResponse.status} ${videoResponse.statusText}`
        );
      }

      const videoBuffer = await videoResponse.arrayBuffer();
      console.log('Video downloaded, size:', videoBuffer.byteLength, 'bytes');

      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const fileName = `input-${timestamp}-${random}.mp4`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(fileName, videoBuffer, {
          contentType: 'video/mp4',
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        throw new Error(`Failed to upload to Supabase: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      console.log('Video uploaded to Supabase:', urlData.publicUrl);

      // Return the Supabase URL for processing
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: true,
          videoUrl: urlData.publicUrl,
          fileName: fileName,
          mode: mode,
          message: 'Video uploaded to Supabase Storage - ready for processing',
          size: videoBuffer.byteLength,
        }),
      };
    } catch (error) {
      console.error('Error processing video:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in crop-tiktok function:', error);

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Failed to process video',
        details: error.message,
      }),
    };
  }
};
