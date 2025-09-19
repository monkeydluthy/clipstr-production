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

async function setupSupabaseStorage() {
  try {
    console.log('🔧 Setting up Supabase Storage...');
    
    // Check if videos bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }
    
    const videosBucket = buckets.find(bucket => bucket.id === 'videos');
    
    if (videosBucket) {
      console.log('✅ Videos bucket already exists');
      console.log('Bucket details:', videosBucket);
    } else {
      console.log('📦 Creating videos bucket...');
      
      // Create the videos bucket (simple version)
      const { data, error } = await supabase.storage.createBucket('videos', {
        public: true
      });
      
      if (error) {
        console.error('❌ Error creating bucket:', error);
        return;
      }
      
      console.log('✅ Videos bucket created successfully!');
      console.log('Bucket details:', data);
    }
    
    // Test upload a small file to verify bucket works
    console.log('🧪 Testing bucket with a small test file...');
    
    const testContent = 'This is a test file for Supabase Storage';
    const testFileName = `test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('videos')
      .upload(testFileName, testContent, {
        contentType: 'text/plain',
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      console.error('❌ Test upload failed:', uploadError);
      return;
    }
    
    console.log('✅ Test upload successful!');
    console.log('Upload details:', uploadData);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('videos')
      .getPublicUrl(testFileName);
    
    console.log('🔗 Test file public URL:', urlData.publicUrl);
    
    // Clean up test file
    const { error: deleteError } = await supabase.storage
      .from('videos')
      .remove([testFileName]);
    
    if (deleteError) {
      console.warn('⚠️ Could not clean up test file:', deleteError);
    } else {
      console.log('🧹 Test file cleaned up');
    }
    
    console.log('🎉 Supabase Storage setup complete!');
    console.log('Your videos bucket is ready for video uploads.');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run the setup
setupSupabaseStorage();
