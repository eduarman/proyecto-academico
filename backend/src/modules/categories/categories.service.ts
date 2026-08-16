import type { Bindings } from '../../env';
import { getSupabase } from '../../lib/supabase';
import { conflict, notFound } from '../../lib/http-error';

export interface Category {
  code: string;
  label: string;
}

const DIACRITICS_PATTERN = new RegExp('[' + '̀-ͯ' + ']', 'g');

function toCode(label: string): string {
  return label
    .normalize('NFD')
    .replace(DIACRITICS_PATTERN, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export async function findAllCategories(env: Bindings): Promise<Category[]> {
  const db = getSupabase(env);
  const { data, error } = await db.from('categories').select('code,label').order('label');
  if (error) throw error;
  return data as Category[];
}

export async function categoryExists(env: Bindings, code: string): Promise<boolean> {
  const db = getSupabase(env);
  const { data, error } = await db.from('categories').select('code').eq('code', code).maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function createCategory(env: Bindings, label: string): Promise<Category> {
  const trimmed = label.trim();
  const code = toCode(trimmed);

  const db = getSupabase(env);
  const { data, error } = await db.from('categories').insert({ code, label: trimmed }).select('code,label').single();
  if (error) {
    if (error.code === '23505') throw conflict('Ya existe una categoría con ese nombre');
    throw error;
  }
  return data as Category;
}

// El código no cambia al renombrar: los cursos existentes referencian la categoría por code.
export async function updateCategory(env: Bindings, code: string, label: string): Promise<Category> {
  const db = getSupabase(env);
  const { data, error } = await db
    .from('categories')
    .update({ label: label.trim() })
    .eq('code', code)
    .select('code,label')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw notFound('Categoría no encontrada');
  return data as Category;
}

export async function removeCategory(env: Bindings, code: string): Promise<Category> {
  const db = getSupabase(env);
  const { data, error } = await db.from('categories').delete().eq('code', code).select('code,label').maybeSingle();
  if (error) throw error;
  if (!data) throw notFound('Categoría no encontrada');
  return data as Category;
}
