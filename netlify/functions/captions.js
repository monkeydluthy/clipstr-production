// Using direct API calls instead of OpenAI SDK for Netlify compatibility

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
    const { mp4Url, language = 'en' } = JSON.parse(event.body);

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

    // Check for OpenAI API key
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'OpenAI API key not configured' }),
      };
    }

    // OpenAI API key is available, proceeding with direct API calls

    console.log('Downloading video from:', mp4Url);

    // Download the video file
    const videoResponse = await fetch(mp4Url);
    if (!videoResponse.ok) {
      throw new Error(`Failed to download video: ${videoResponse.status} ${videoResponse.statusText}`);
    }

    const videoBuffer = await videoResponse.arrayBuffer();
    console.log('Video downloaded, size:', videoBuffer.byteLength, 'bytes');

    console.log('Sending to OpenAI Whisper...');

    // Create a FormData object for OpenAI Whisper (File constructor not available in Netlify)
    const formData = new FormData();
    const blob = new Blob([videoBuffer], { type: 'video/mp4' });
    formData.append('file', blob, 'video.mp4');
    formData.append('model', 'whisper-1');
    formData.append('language', language);
    formData.append('response_format', 'srt');

    // Make direct API call to OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: formData
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${openaiResponse.status} ${errorText}`);
    }

    const transcription = await openaiResponse.text();

    console.log('Transcription completed');

    // Return SRT captions as plain text
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain',
      },
      body: transcription,
    };

  } catch (error) {
    console.error('Error processing captions:', error);

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Failed to process captions',
        details: error.message 
      }),
    };
  }
};
