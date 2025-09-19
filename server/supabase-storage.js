import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Upload a video file to Supabase Storage
 * @param {Buffer} videoBuffer - The video file buffer
 * @param {string} fileName - The file name (e.g., 'processed-video-123.mp4')
 * @param {string} bucketName - The storage bucket name (default: 'videos')
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export async function uploadVideoToSupabase(
  videoBuffer,
  fileName,
  bucketName = 'videos'
) {
  try {
    console.log(`Uploading video to Supabase Storage: ${fileName}`);

    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, videoBuffer, {
        contentType: 'video/mp4',
        cacheControl: '3600',
        upsert: true, // Overwrite if file exists
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return { success: false, error: error.message };
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    console.log(`Video uploaded successfully: ${urlData.publicUrl}`);

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a video file from Supabase Storage
 * @param {string} fileName - The file name to delete
 * @param {string} bucketName - The storage bucket name (default: 'videos')
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteVideoFromSupabase(fileName, bucketName = 'videos') {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);

    if (error) {
      console.error('Supabase delete error:', error);
      return { success: false, error: error.message };
    }

    console.log(`Video deleted successfully: ${fileName}`);
    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate a unique filename for video uploads
 * @param {string} prefix - Prefix for the filename (e.g., 'processed', 'cropped')
 * @returns {string} - Unique filename
 */
export function generateVideoFileName(prefix = 'video') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}.mp4`;
}

export default supabase;
