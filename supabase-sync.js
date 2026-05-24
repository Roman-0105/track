'use strict';

// ─────────────────────────────────────────────────────────────
//  SupabaseSync — прозрачная синхронизация localStorage ↔ Supabase
//  Все данные (наряды, визиты, нарушения, фото) автоматически
//  сохраняются в облако и доступны на любом устройстве.
// ─────────────────────────────────────────────────────────────
const SupabaseSync = (() => {

  // Перехватываем Data._set → пишем в Supabase после каждого изменения
  const _orig = Data._set.bind(Data);
  Data._set = function(key, val) {
    _orig(key, val);
    if (sbEnabled) _upsert(key, val);
  };

  // ── Запись таблицы в Supabase ────────────────────────────────
  async function _upsert(key, val) {
    try {
      await sb.from('app_data').upsert(
        { key, value: val, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
    } catch (e) {
      console.warn('[Supabase] upsert error:', e);
    }
  }

  // ── Загрузка всех данных из Supabase в localStorage ──────────
  async function loadFromCloud() {
    if (!sbEnabled) return false;
    try {
      const { data, error } = await sb.from('app_data').select('key, value');
      if (error || !data || !data.length) return false;
      data.forEach(row => {
        localStorage.setItem(row.key, JSON.stringify(row.value));
      });
      return true;
    } catch (e) {
      console.warn('[Supabase] load error:', e);
      return false;
    }
  }

  // ── Загрузка фото в Supabase Storage ─────────────────────────
  // Принимает dataUrl (base64), возвращает публичный URL или null
  async function uploadPhoto(dataUrl, filename) {
    if (!sbEnabled) return dataUrl;
    try {
      const res  = await fetch(dataUrl);
      const blob = await res.blob();
      const path = `photos/${Date.now()}_${filename}.jpg`;

      const { data, error } = await sb.storage
        .from('tbo-photos')
        .upload(path, blob, { contentType: 'image/jpeg', upsert: false });

      if (error) { console.warn('[Supabase Storage] upload error:', error); return dataUrl; }

      const { data: { publicUrl } } = sb.storage.from('tbo-photos').getPublicUrl(data.path);
      return publicUrl;
    } catch (e) {
      console.warn('[Supabase Storage] error:', e);
      return dataUrl; // fallback: base64 остаётся локально
    }
  }

  // ── Инициализация: загружаем из облака, потом запускаем app ──
  async function init(callback) {
    if (sbEnabled) {
      const loaded = await loadFromCloud();
      if (loaded) console.info('[Supabase] данные загружены из облака');
      else         console.info('[Supabase] облако пусто — используем локальные данные');
    }
    callback(); // запустить App.init()
  }

  // ── Периодическое обновление данных (polling каждые 30 сек) ──
  function startPolling() {
    if (!sbEnabled) return;
    setInterval(async () => {
      const loaded = await loadFromCloud();
      if (loaded) {
        // Тихое обновление UI без полного перезапуска
        console.info('[Supabase] фоновое обновление данных');
      }
    }, 30000);
  }

  return { init, uploadPhoto, startPolling };
})();
