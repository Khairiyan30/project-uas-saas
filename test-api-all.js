const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const supabaseUrl = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const supabaseAnonKey = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)[1].trim();
const supabase = createClient(supabaseUrl, supabaseAnonKey);

let ok = 0, fail = 0;

async function t(name, fn) {
  process.stdout.write(`  ${name}... `);
  try {
    await fn();
    console.log('✅');
    ok++;
    return true;
  } catch (e) {
    console.log(`❌ ${e.message}`);
    fail++;
    return false;
  }
}

async function main() {
  const email = `test2_${Date.now()}@example.com`;
  const pass = 'TestPass123!';

  // 1. Signup
  console.log('\n--- AUTH ---');
  await t('Signup', async () => {
    const { data, error } = await supabase.auth.signUp({ email, password: pass, options: { data: { full_name: 'Test User' } } });
    if (error) throw error;
    userId = data.user.id;
    token = data.session?.access_token;
    if (!token) throw new Error('No auto-confirm session');
  });

  // 2. Profile (trigger handle_new_user)
  await t('Profile terbuat otomatis', async () => {
    const { data, error } = await supabase.from('profiles').select('id,email,full_name').eq('id', userId).single();
    if (error) throw error;
    if (!data) throw new Error('Profile not found');
  });

  // 3. Login
  await t('Login', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    token = data.session.access_token;
  });

  // 4. Me
  await t('GET /api/auth/me', async () => {
    const res = await fetch('http://localhost:3002/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`${res.status}`);
    const d = await res.json();
    if (!d.user) throw new Error('No user');
  });

  // 5. Projects - list (kosong)
  console.log('\n--- PROJECTS ---');
  await t('GET /api/projects (empty)', async () => {
    const res = await fetch('http://localhost:3002/api/projects', { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`${res.status}`);
    const d = await res.json();
    if (!Array.isArray(d.projects)) throw Error('not array');
  });

  // 6. Create project
  const slug = `test-${Date.now()}`;
  await t('POST /api/projects', async () => {
    const res = await fetch('http://localhost:3002/api/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Wedding', event_type: 'Wedding', description: 'Desc' }),
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    const d = await res.json();
    projectId = d.project.id;
  });

  // 7. Get single project
  await t('GET /api/projects/[id]', async () => {
    const res = await fetch(`http://localhost:3002/api/projects/${projectId}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`${res.status}`);
  });

  // 8. Update progress
  await t('PATCH /api/projects/[id]/progress', async () => {
    const res = await fetch(`http://localhost:3002/api/projects/${projectId}/progress`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress_status: 'Proses Edit' }),
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  });

  // 9. Create photo — kirim file dummy via formData
  console.log('\n--- PHOTOS ---');
  await t('POST /api/projects/[id]/photos', async () => {
    const blob = new Blob(['dummy-photo-content'], { type: 'image/jpeg' });
    const fd = new FormData();
    fd.append('file', blob, 'test-photo.jpg');
    const res = await fetch(`http://localhost:3002/api/projects/${projectId}/photos`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    const d = await res.json();
    photoId = d.photo?.id;
  });

  // 10. Get photos
  await t('GET /api/projects/[id]/photos', async () => {
    const res = await fetch(`http://localhost:3002/api/projects/${projectId}/photos`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`${res.status}`);
  });

  // 11. Toggle favorite via API route
  await t('PATCH /api/photos/[id]/favorite', async () => {
    const res = await fetch(`http://localhost:3002/api/photos/${photoId}/favorite`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_favorite: true }),
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  });

  // 12. Gallery public (anon, tanpa token)
  console.log('\n--- GALLERY ---');
  await t('GET /api/gallery/[slug]', async () => {
    const { data: p } = await supabase.from('projects').select('unique_slug').eq('id', projectId).single();
    const res = await fetch(`http://localhost:3002/api/gallery/${p.unique_slug}`, { headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    const d = await res.json();
    if (!d.project) throw Error('no project');
  });

  // 13. Update cover
  await t('PATCH /api/projects/[id]/cover', async () => {
    const res = await fetch(`http://localhost:3002/api/projects/${projectId}/cover`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url_original: 'https://example.com/cover.jpg' }),
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  });

  // 14. Delete photo
  await t('DELETE /api/photos/[id]', async () => {
    const res = await fetch(`http://localhost:3002/api/photos/${photoId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`${res.status}`);
  });

  // 15. Delete project
  await t('DELETE /api/projects/[id]', async () => {
    const res = await fetch(`http://localhost:3002/api/projects/${projectId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`${res.status}`);
  });

  // Cleanup auth user
  await supabase.auth.signOut();

  console.log(`\n📊 ${ok}/${ok+fail} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });