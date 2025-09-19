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

async function setupNewSupabase() {
  try {
    console.log('🔧 Setting up new Supabase account...');
    console.log('Supabase URL:', supabaseUrl);

    // Test connection
    console.log('🧪 Testing Supabase connection...');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError && authError.message !== 'Auth session missing!') {
      console.error('❌ Supabase connection failed:', authError);
      return;
    }

    console.log('✅ Supabase connection successful');

    // Check if videos bucket exists
    console.log('📦 Checking for videos bucket...');
    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }

    console.log(
      'Available buckets:',
      buckets.map((b) => b.id)
    );

    const videosBucket = buckets.find((bucket) => bucket.id === 'videos');

    if (videosBucket) {
      console.log('✅ Videos bucket already exists');
      console.log('Bucket details:', videosBucket);
    } else {
      console.log('📦 Creating videos bucket...');

      try {
        const { data, error } = await supabase.storage.createBucket('videos', {
          public: true,
        });

        if (error) {
          console.error('❌ Error creating bucket:', error);
          console.log(
            'This is likely due to RLS policies. You may need to create the bucket manually in the Supabase Dashboard.'
          );
          return;
        }

        console.log('✅ Videos bucket created successfully!');
        console.log('Bucket details:', data);
      } catch (err) {
        console.error('❌ Bucket creation failed:', err);
        console.log(
          'Please create the bucket manually in the Supabase Dashboard.'
        );
        return;
      }
    }

    // Test bucket access
    console.log('🧪 Testing bucket access...');

    try {
      // Try to list files in the videos bucket
      const { data: files, error: listFilesError } = await supabase.storage
        .from('videos')
        .list();

      if (listFilesError) {
        console.error('❌ Cannot access videos bucket:', listFilesError);
        console.log(
          'You may need to set up RLS policies manually in the Supabase Dashboard.'
        );
        return;
      }

      console.log('✅ Can access videos bucket');
      console.log('Files in bucket:', files);

      // Test upload a small file
      console.log('🧪 Testing file upload...');
      const testContent = 'This is a test file for the new Supabase account';
      const testFileName = `test-${Date.now()}.txt`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(testFileName, testContent, {
          contentType: 'text/plain',
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('❌ Test upload failed:', uploadError);
        console.log('You may need to set up RLS policies for uploads.');
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

      console.log('🎉 New Supabase account setup complete!');
      console.log('Your videos bucket is ready for video uploads.');
    } catch (err) {
      console.error('❌ Bucket access test failed:', err);
      console.log(
        'You may need to set up RLS policies manually in the Supabase Dashboard.'
      );
    }
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run the setup
setupNewSupabase();
