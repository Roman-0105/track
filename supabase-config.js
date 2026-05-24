'use strict';

// ─────────────────────────────────────────────────────────────
// ШАГИ ДЛЯ НАСТРОЙКИ:
//
// 1. Зайдите на https://supabase.com и создайте новый проект
// 2. В панели Supabase откройте: Settings → API
// 3. Скопируйте "Project URL" и вставьте вместо PASTE_YOUR_URL
// 4. Скопируйте "anon public" key и вставьте вместо PASTE_YOUR_KEY
// 5. Сохраните файл
// ─────────────────────────────────────────────────────────────

const SUPABASE_URL  = 'PASTE_YOUR_URL_HERE';
const SUPABASE_KEY  = 'PASTE_YOUR_KEY_HERE';

// Не трогайте строки ниже
const sbEnabled = SUPABASE_URL !== 'PASTE_YOUR_URL_HERE' && SUPABASE_KEY !== 'PASTE_YOUR_KEY_HERE';
const sb = sbEnabled ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;
