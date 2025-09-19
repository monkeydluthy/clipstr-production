import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client with service role key (if available) or anon key
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupSupabaseRLS() {
  try {
    console.log('🔧 Setting up Supabase RLS policies for Storage...');

    // First, let's try to create the bucket if it doesn't exist
    console.log('📦 Creating videos bucket...');

    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }

    const videosBucket = buckets.find((bucket) => bucket.id === 'videos');

    if (!videosBucket) {
      console.log('Creating videos bucket...');

      // Try to create bucket with minimal settings
      const { data, error } = await supabase.storage.createBucket('videos', {
        public: true,
      });

      if (error) {
        console.error('❌ Error creating bucket:', error);
        console.log(
          "This might be due to RLS policies. Let's try to set them up first."
        );
      } else {
        console.log('✅ Videos bucket created successfully!');
      }
    } else {
      console.log('✅ Videos bucket already exists');
    }

    // Now let's set up RLS policies
    console.log('🔐 Setting up RLS policies...');

    // Policy 1: Allow public read access to videos
    const readPolicy = `
      CREATE POLICY "Public read access for videos" ON storage.objects
      FOR SELECT USING (bucket_id = 'videos');
    `;

    // Policy 2: Allow public insert/upload to videos bucket
    const insertPolicy = `
      CREATE POLICY "Public insert access for videos" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'videos');
    `;

    // Policy 3: Allow public update to videos bucket
    const updatePolicy = `
      CREATE POLICY "Public update access for videos" ON storage.objects
      FOR UPDATE USING (bucket_id = 'videos');
    `;

    // Policy 4: Allow public delete from videos bucket
    const deletePolicy = `
      CREATE POLICY "Public delete access for videos" ON storage.objects
      FOR DELETE USING (bucket_id = 'videos');
    `;

    const policies = [
      { name: 'Public read access', sql: readPolicy },
      { name: 'Public insert access', sql: insertPolicy },
      { name: 'Public update access', sql: updatePolicy },
      { name: 'Public delete access', sql: deletePolicy },
    ];

    for (const policy of policies) {
      try {
        console.log(`Setting up ${policy.name}...`);

        const { data, error } = await supabase.rpc('exec_sql', {
          sql: policy.sql,
        });

        if (error) {
          console.log(`⚠️ ${policy.name} might already exist:`, error.message);
        } else {
          console.log(`✅ ${policy.name} created successfully`);
        }
      } catch (err) {
        console.log(`⚠️ ${policy.name} setup skipped:`, err.message);
      }
    }

    // Alternative approach: Try to enable RLS and create a simple policy
    console.log('🔄 Trying alternative RLS setup...');

    try {
      // Enable RLS on storage.objects if not already enabled
      const enableRLS = `
        ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
      `;

      const { error: rlsError } = await supabase.rpc('exec_sql', {
        sql: enableRLS,
      });

      if (rlsError) {
        console.log('RLS might already be enabled:', rlsError.message);
      } else {
        console.log('✅ RLS enabled on storage.objects');
      }
    } catch (err) {
      console.log('RLS setup skipped:', err.message);
    }

    // Test the bucket access
    console.log('🧪 Testing bucket access...');

    try {
      // Try to list files in the videos bucket
      const { data: files, error: listFilesError } = await supabase.storage
        .from('videos')
        .list();

      if (listFilesError) {
        console.error('❌ Cannot access videos bucket:', listFilesError);
      } else {
        console.log('✅ Can access videos bucket');
        console.log('Files in bucket:', files);
      }
    } catch (err) {
      console.error('❌ Bucket access test failed:', err);
    }

    console.log('🎉 RLS setup complete!');
    console.log('If you still get "Bucket not found" errors, you may need to:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to Storage > Policies');
    console.log('3. Create a new policy manually with these settings:');
    console.log('   - Target: storage.objects');
    console.log('   - Operation: All');
    console.log("   - Policy definition: bucket_id = 'videos'");
    console.log('   - Policy name: "Allow all access to videos bucket"');
  } catch (error) {
    console.error('❌ RLS setup failed:', error);
  }
}

// Run the setup
setupSupabaseRLS();
