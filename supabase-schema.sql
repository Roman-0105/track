-- ═══════════════════════════════════════════════════════════
--  ТБО Мониторинг — схема базы данных Supabase
--  Запустите этот файл в: Supabase → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════

-- 1. Основная таблица для хранения всех данных приложения
CREATE TABLE IF NOT EXISTS app_data (
  key        TEXT PRIMARY KEY,
  value      JSONB        NOT NULL,
  updated_at TIMESTAMPTZ  DEFAULT NOW()
);

-- 2. Включаем Row Level Security (RLS)
ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;

-- 3. Разрешаем чтение всем (anon-ключ)
CREATE POLICY "Allow public read"
  ON app_data FOR SELECT
  USING (true);

-- 4. Разрешаем запись всем (anon-ключ)
CREATE POLICY "Allow public insert"
  ON app_data FOR INSERT
  WITH CHECK (true);

-- 5. Разрешаем обновление всем (anon-ключ)
CREATE POLICY "Allow public update"
  ON app_data FOR UPDATE
  USING (true);

-- ═══════════════════════════════════════════════════════════
--  Storage bucket для фотографий
--  Настройте в: Supabase → Storage → New bucket
--  Имя bucket: tbo-photos
--  Public bucket: YES (включить публичный доступ)
-- ═══════════════════════════════════════════════════════════

-- Политика для Storage (запускать отдельно если нужно)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('tbo-photos', 'tbo-photos', true);

-- Разрешить загрузку файлов
CREATE POLICY "Allow photo upload"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'tbo-photos');

-- Разрешить просмотр фотографий
CREATE POLICY "Allow photo read"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'tbo-photos');
