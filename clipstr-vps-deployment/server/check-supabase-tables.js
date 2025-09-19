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

async function checkSupabaseTables() {
  try {
    console.log('🔍 Checking Supabase tables and storage...');
    console.log('Supabase URL:', supabaseUrl);

    // Test basic connection
    console.log('🧪 Testing basic connection...');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError && authError.message !== 'Auth session missing!') {
      console.error('❌ Supabase connection failed:', authError);
      return;
    }

    console.log('✅ Supabase connection successful');

    // Check storage buckets
    console.log('📦 Checking storage buckets...');
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
    } else {
      console.log(
        '✅ Buckets found:',
        buckets.map((b) => ({ id: b.id, name: b.name, public: b.public }))
      );
    }

    // Check if we can access storage.objects table
    console.log('🗄️ Checking storage.objects table...');
    try {
      const { data, error } = await supabase
        .from('storage.objects')
        .select('*')
        .limit(1);

      if (error) {
        console.error('❌ Cannot access storage.objects table:', error);
        console.log(
          "This might mean RLS is not enabled or the table doesn't exist"
        );
      } else {
        console.log('✅ Can access storage.objects table');
        console.log('Sample data:', data);
      }
    } catch (err) {
      console.error('❌ Error accessing storage.objects:', err);
    }

    // Try to check RLS status
    console.log('🔐 Checking RLS status...');
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: "SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'objects' AND schemaname = 'storage';",
      });

      if (error) {
        console.log('⚠️ Cannot check RLS status via SQL:', error.message);
      } else {
        console.log('✅ RLS status:', data);
      }
    } catch (err) {
      console.log('⚠️ SQL check failed:', err.message);
    }

    // Test bucket access
    console.log('🧪 Testing videos bucket access...');
    try {
      const { data: files, error: listError } = await supabase.storage
        .from('videos')
        .list();

      if (listError) {
        console.error('❌ Cannot list files in videos bucket:', listError);
      } else {
        console.log('✅ Can list files in videos bucket:', files);
      }
    } catch (err) {
      console.error('❌ Videos bucket test failed:', err);
    }

    console.log('\n🎯 Next Steps:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to Authentication > Policies');
    console.log('3. Look for "storage.objects" in the list');
    console.log(
      "4. If you don't see it, you may need to enable RLS on the storage schema"
    );
    console.log(
      '5. Alternatively, try going to Storage > Settings to configure policies'
    );
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

// Run the check
checkSupabaseTables();
