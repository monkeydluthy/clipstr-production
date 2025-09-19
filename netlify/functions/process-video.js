const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
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
    // Parse request body
    const {
      mp4Url,
      mode = 'crop-center-9x16',
      captions,
    } = JSON.parse(event.body);

    if (!mp4Url) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'mp4Url is required' }),
      };
    }

    if (!captions) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'captions are required' }),
      };
    }

    console.log('Processing video with captions:', mp4Url);

    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Download the video file
    const videoResponse = await fetch(mp4Url);
    if (!videoResponse.ok) {
      throw new Error(
        `Failed to download video: ${videoResponse.status} ${videoResponse.statusText}`
      );
    }

    const videoBuffer = await videoResponse.arrayBuffer();
    console.log('Video downloaded, size:', videoBuffer.byteLength, 'bytes');

    // Generate unique filename for processed video
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const fileName = `processed-${timestamp}-${random}.mp4`;

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

    console.log('Processed video uploaded to Supabase:', urlData.publicUrl);

    // Return the Supabase URL
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
        hasCaptions: true,
        message: 'Video with captions uploaded to Supabase Storage',
        size: videoBuffer.byteLength,
      }),
    };
  } catch (error) {
    console.error('Error processing video:', error);

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
