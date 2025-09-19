const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    console.log('Get-captions function called with method:', event.httpMethod);
    console.log('Parsing request body...');

    const { mp4Url } = JSON.parse(event.body);
    console.log('Request parsed successfully:', { mp4Url });

    if (!mp4Url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'mp4Url is required' }),
      };
    }

    console.log('Getting captions for video:', mp4Url);

    // Download video for transcription
    const videoResponse = await fetch(mp4Url);
    const videoBuffer = await videoResponse.arrayBuffer();

    console.log('Video downloaded, size:', videoBuffer.byteLength, 'bytes');

    // Compress video for transcription if it's too large (>20MB for faster processing)
    let finalVideoBuffer = videoBuffer;

    if (videoBuffer.byteLength > 20 * 1024 * 1024) {
      console.log('Video too large, compressing for OpenAI transcription...');

      try {
        // Upload to Cloudinary for compression
        const compressionResult = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                resource_type: 'video',
                folder: 'transcription-compression',
                public_id: `compressed-${Date.now()}`,
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            )
            .end(Buffer.from(videoBuffer));
        });

        // Get compressed video URL with aggressive compression
        const compressedUrl = cloudinary.url(compressionResult.public_id, {
          resource_type: 'video',
          transformation: [
            { quality: 'auto:low' },
            { width: 480 },
            { height: 854 },
            { crop: 'scale' },
            { format: 'mp4' },
          ],
          format: 'mp4',
        });

        // Download compressed video
        const compressedResponse = await fetch(compressedUrl);
        if (compressedResponse.ok) {
          finalVideoBuffer = await compressedResponse.arrayBuffer();
          console.log(
            'Compressed video size:',
            finalVideoBuffer.byteLength,
            'bytes'
          );
        }
      } catch (compressionError) {
        console.error('Video compression failed:', compressionError);
        console.log('Using original video for transcription');
      }
    }

    // Proceed with transcription if video is now small enough
    if (finalVideoBuffer.byteLength <= 25 * 1024 * 1024) {
      // Create FormData for OpenAI API
      const formData = new FormData();
      const videoBlob = new Blob([finalVideoBuffer], {
        type: 'video/mp4',
      });
      formData.append('file', videoBlob, 'video.mp4');
      formData.append('model', 'whisper-1');
      formData.append('response_format', 'srt');

      const openaiResponse = await fetch(
        'https://api.openai.com/v1/audio/transcriptions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: formData,
        }
      );

      if (openaiResponse.ok) {
        const captionsText = await openaiResponse.text();
        console.log('OpenAI captions generated:', captionsText);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            captions: captionsText,
          }),
        };
      } else {
        console.error(
          'OpenAI transcription failed:',
          await openaiResponse.text()
        );
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            captions: 'Auto-generated captions',
          }),
        };
      }
    } else {
      console.log('Video still too large after compression, using fallback');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          captions:
            'Auto-generated captions (video too large for transcription)',
        }),
      };
    }
  } catch (error) {
    console.error('Get-captions function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};
