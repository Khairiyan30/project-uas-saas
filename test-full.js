const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

console.log("=".repeat(60));
console.log("🔍 FULL DATABASE & API TESTING - SHOOLINK");
console.log("=".repeat(60));
console.log();

// Baca .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
const keyMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);

if (!urlMatch || !keyMatch) {
  console.error("❌ Error: Kredensial tidak ditemukan di .env.local");
  process.exit(1);
}

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();

// Validasi bahwa ini adalah Supabase online, BUKAN localhost
if (supabaseUrl.includes('localhost') || supabaseUrl.includes('127.0.0.1')) {
  console.error("❌ CRITICAL ERROR: URL mengarah ke database lokal!");
  console.error(`   URL saat ini: ${supabaseUrl}`);
  console.error("   Pastikan menggunakan URL Supabase online (https://xxx.supabase.co)");
  process.exit(1);
}

console.log("📋 KONFIGURASI DATABASE:");
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseKey.substring(0, 20)}...${supabaseKey.substring(supabaseKey.length - 10)}`);
console.log(`   Type: ${supabaseUrl.includes('supabase.co') ? '✅ SUPABASE ONLINE' : '⚠️  UNKNOWN'}`);
console.log();

const supabase = createClient(supabaseUrl, supabaseKey);
let accessToken = null;
let userId = null;
let testProjectId = null;
let testPhotoId = null;

async function runTest(testName, testFn) {
  console.log(`⏳ ${testName}...`);
  try {
    await testFn();
    console.log(`✅ ${testName} - SUCCESS\n`);
    return true;
  } catch (error) {
    console.error(`❌ ${testName} - FAILED`);
    console.error(`   Error: ${error.message}\n`);
    return false;
  }
}

async function main() {
  let passed = 0;
  let failed = 0;

  // TEST 1: Koneksi Database
  const test1 = await runTest("TEST 1: Koneksi ke Database", async () => {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Database error: ${error.message}`);
    }
  });
  test1 ? passed++ : failed++;

  // TEST 2: Cek Storage Buckets
  const test2 = await runTest("TEST 2: Cek Storage Buckets", async () => {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) throw new Error(`Storage error: ${error.message}`);
    
    const bucketNames = buckets.map(b => b.name);
    console.log(`   Buckets ditemukan: ${bucketNames.join(', ') || 'KOSONG'}`);
    
    if (!bucketNames.includes('photos')) {
      console.log(`   ⚠️  Warning: Bucket 'photos' belum ada`);
    }
    if (!bucketNames.includes('avatars')) {
      console.log(`   ⚠️  Warning: Bucket 'avatars' belum ada`);
    }
  });
  test2 ? passed++ : failed++;

  // TEST 3: Signup Test User
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'TestPass123!';
  
  const test3 = await runTest("TEST 3: Registrasi User Baru", async () => {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: { full_name: 'Test User' }
      }
    });
    
    if (error) throw new Error(`Signup error: ${error.message}`);
    if (!data.user) throw new Error('No user returned');
    
    userId = data.user.id;
    console.log(`   User ID: ${userId}`);
    console.log(`   Email: ${testEmail}`);
    
    // Jika auto-confirm aktif, session akan langsung ada
    if (data.session) {
      accessToken = data.session.access_token;
      console.log(`   ✅ Auto-confirmed, token tersedia`);
    } else {
      console.log(`   ⚠️  Email confirmation required`);
    }
  });
  test3 ? passed++ : failed++;

  // TEST 4: Login
  const test4 = await runTest("TEST 4: Login User", async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (error) throw new Error(`Login error: ${error.message}`);
    
    accessToken = data.session.access_token;
    userId = data.user.id;
    console.log(`   Token: ${accessToken.substring(0, 30)}...`);
  });
  test4 ? passed++ : failed++;

  // TEST 5: Fetch User Profile
  const test5 = await runTest("TEST 5: Fetch User Profile", async () => {
    if (!accessToken) throw new Error('No access token');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', userId)
      .single();
    
    if (error) throw new Error(`Profile fetch error: ${error.message}`);
    
    console.log(`   Profile: ${data.full_name} (${data.email})`);
  });
  test5 ? passed++ : failed++;

  // TEST 6: Create Project
  const test6 = await runTest("TEST 6: Buat Proyek Baru", async () => {
    if (!accessToken) throw new Error('No access token');
    
    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        name: `Test Project ${Date.now()}`,
        event_type: 'Wedding',
        description: 'Test project description',
        progress_status: 'Persiapan',
        unique_slug: `test-project-${Date.now()}`
      })
      .select()
      .single();
    
    if (error) throw new Error(`Create project error: ${error.message}`);
    
    testProjectId = data.id;
    console.log(`   Project ID: ${testProjectId}`);
    console.log(`   Name: ${data.name}`);
    console.log(`   Slug: ${data.unique_slug}`);
  });
  test6 ? passed++ : failed++;

  // TEST 7: Read Projects
  const test7 = await runTest("TEST 7: Baca Daftar Proyek", async () => {
    if (!accessToken) throw new Error('No access token');
    
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, event_type, progress_status')
      .eq('user_id', userId);
    
    if (error) throw new Error(`Read projects error: ${error.message}`);
    
    console.log(`   Total proyek: ${data.length}`);
    data.forEach(p => {
      console.log(`   - ${p.name} (${p.event_type}) - ${p.progress_status}`);
    });
  });
  test7 ? passed++ : failed++;

  // TEST 8: Create Photo
  const test8 = await runTest("TEST 8: Upload Foto (Metadata)", async () => {
    if (!testProjectId) throw new Error('No project ID');
    
    const { data, error } = await supabase
      .from('photos')
      .insert({
        project_id: testProjectId,
        url_original: 'https://example.com/original.jpg',
        url_edited: null,
        filename: 'test_photo.jpg',
        is_favorite: false
      })
      .select()
      .single();
    
    if (error) throw new Error(`Create photo error: ${error.message}`);
    
    testPhotoId = data.id;
    console.log(`   Photo ID: ${testPhotoId}`);
    console.log(`   Filename: ${data.filename}`);
  });
  test8 ? passed++ : failed++;

  // TEST 9: Toggle Favorite via RPC
  const test9 = await runTest("TEST 9: Toggle Favorite (RPC)", async () => {
    if (!testPhotoId) throw new Error('No photo ID');
    
    // Toggle ke true
    const { error: error1 } = await supabase.rpc('toggle_favorite', {
      photo_id: testPhotoId,
      value: true
    });
    
    if (error1) throw new Error(`RPC error (set true): ${error1.message}`);
    
    // Verifikasi
    const { data, error: error2 } = await supabase
      .from('photos')
      .select('is_favorite')
      .eq('id', testPhotoId)
      .single();
    
    if (error2) throw new Error(`Verify error: ${error2.message}`);
    if (!data.is_favorite) throw new Error('Favorite not toggled to true');
    
    console.log(`   ✅ Favorite berhasil di-toggle ke TRUE`);
    
    // Toggle kembali ke false
    const { error: error3 } = await supabase.rpc('toggle_favorite', {
      photo_id: testPhotoId,
      value: false
    });
    
    if (error3) throw new Error(`RPC error (set false): ${error3.message}`);
    console.log(`   ✅ Favorite berhasil di-toggle ke FALSE`);
  });
  test9 ? passed++ : failed++;

  // TEST 10: Update Project Status
  const test10 = await runTest("TEST 10: Update Status Proyek", async () => {
    if (!testProjectId) throw new Error('No project ID');
    
    const { data, error } = await supabase
      .from('projects')
      .update({ progress_status: 'Proses Edit' })
      .eq('id', testProjectId)
      .select()
      .single();
    
    if (error) throw new Error(`Update error: ${error.message}`);
    if (data.progress_status !== 'Proses Edit') {
      throw new Error('Status not updated correctly');
    }
    
    console.log(`   Status: ${data.progress_status}`);
  });
  test10 ? passed++ : failed++;

  // TEST 11: Logout
  const test11 = await runTest("TEST 11: Logout User", async () => {
    if (!accessToken) throw new Error('No access token');
    
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(`Logout error: ${error.message}`);
    
    accessToken = null;
    console.log(`   Session cleared`);
  });
  test11 ? passed++ : failed++;

  // TEST 12: Cleanup - Delete Test Data
  const test12 = await runTest("TEST 12: Cleanup Test Data", async () => {
    // Login kembali untuk cleanup
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (loginError) throw new Error(`Login for cleanup error: ${loginError.message}`);
    
    // Delete photo
    if (testPhotoId) {
      const { error: photoError } = await supabase
        .from('photos')
        .delete()
        .eq('id', testPhotoId);
      
      if (photoError) console.log(`   ⚠️  Could not delete photo: ${photoError.message}`);
    }
    
    // Delete project
    if (testProjectId) {
      const { error: projectError } = await supabase
        .from('projects')
        .delete()
        .eq('id', testProjectId);
      
      if (projectError) console.log(`   ⚠️  Could not delete project: ${projectError.message}`);
    }
    
    console.log(`   ✅ Test data cleaned up`);
  });
  test12 ? passed++ : failed++;

  // HASIL AKHIR
  console.log("=".repeat(60));
  console.log("📊 HASIL TESTING:");
  console.log("=".repeat(60));
  console.log(`✅ Passed: ${passed}/${passed + failed}`);
  console.log(`❌ Failed: ${failed}/${passed + failed}`);
  console.log();
  
  if (failed === 0) {
    console.log("🎉 SEMUA TEST BERHASIL!");
    console.log();
    console.log("✅ Database terhubung ke Supabase ONLINE");
    console.log("✅ Autentikasi berfungsi (signup, login, logout)");
    console.log("✅ CRUD Projects berfungsi");
    console.log("✅ Photos & Favorites berfungsi");
    console.log("✅ RPC Functions berfungsi");
    console.log();
    console.log("⚠️  CATATAN:");
    console.log("   - Pastikan Storage Buckets 'photos' dan 'avatars' sudah dibuat");
    console.log("     di Supabase Dashboard > Storage");
    console.log("   - Test user telah dibuat dan bisa dihapus manual jika diperlukan");
  } else {
    console.log("⚠️  ADA TEST YANG GAGAL!");
    console.log("   Silakan periksa error di atas untuk detail masalah.");
  }
  
  console.log("=".repeat(60));
}

main().catch(error => {
  console.error("\n💥 FATAL ERROR:", error);
  process.exit(1);
});
