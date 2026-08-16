import type { Bindings } from '../../env';
import { getSupabase } from '../../lib/supabase';

const BUCKET = 'lesson-files';
const SIGNED_URL_TTL_SECONDS = 60;

export async function uploadLessonFile(env: Bindings, path: string, file: File): Promise<void> {
  const db = getSupabase(env);
  const { error } = await db.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
}

export async function deleteLessonFile(env: Bindings, path: string): Promise<void> {
  const db = getSupabase(env);
  await db.storage.from(BUCKET).remove([path]);
}

export async function getLessonFileSignedUrl(env: Bindings, path: string): Promise<string> {
  const db = getSupabase(env);
  const { data, error } = await db.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (error) throw error;
  return data.signedUrl;
}
