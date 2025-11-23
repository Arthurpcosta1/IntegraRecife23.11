/* ATUALIZADO - Tabela em Português */

/* Table schema:
CREATE TABLE armazenamento_chave_valor (
  chave TEXT NOT NULL PRIMARY KEY,
  valor JSONB NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);
*/

// View at https://supabase.com/dashboard/project/lymkwugkfeamqkiybntd/database/tables

// This file provides a simple key-value interface for storing Figma Make data. It should be adequate for most small-scale use cases.
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const client = () => createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
);

// Nome da tabela em português
const TABELA = "armazenamento_chave_valor";

// Set stores a key-value pair in the database.
export const set = async (key: string, value: any): Promise<void> => {
  const supabase = client()
  const { error } = await supabase.from(TABELA).upsert({
    chave: key,
    valor: value
  });
  if (error) {
    throw new Error(error.message);
  }
};

// Get retrieves a key-value pair from the database.
export const get = async (key: string): Promise<any> => {
  const supabase = client()
  const { data, error } = await supabase.from(TABELA).select("valor").eq("chave", key).maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data?.valor;
};

// Delete deletes a key-value pair from the database.
export const del = async (key: string): Promise<void> => {
  const supabase = client()
  const { error } = await supabase.from(TABELA).delete().eq("chave", key);
  if (error) {
    throw new Error(error.message);
  }
};

// Sets multiple key-value pairs in the database.
export const mset = async (keys: string[], values: any[]): Promise<void> => {
  const supabase = client()
  const { error } = await supabase.from(TABELA).upsert(keys.map((k, i) => ({ chave: k, valor: values[i] })));
  if (error) {
    throw new Error(error.message);
  }
};

// Gets multiple key-value pairs from the database.
export const mget = async (keys: string[]): Promise<any[]> => {
  const supabase = client()
  const { data, error } = await supabase.from(TABELA).select("valor").in("chave", keys);
  if (error) {
    throw new Error(error.message);
  }
  return data?.map((d) => d.valor) ?? [];
};

// Deletes multiple key-value pairs from the database.
export const mdel = async (keys: string[]): Promise<void> => {
  const supabase = client()
  const { error } = await supabase.from(TABELA).delete().in("chave", keys);
  if (error) {
    throw new Error(error.message);
  }
};

// Search for key-value pairs by prefix.
export const getByPrefix = async (prefix: string): Promise<any[]> => {
  const supabase = client()
  const { data, error } = await supabase.from(TABELA).select("chave, valor").like("chave", prefix + "%");
  if (error) {
    throw new Error(error.message);
  }
  return data?.map((d) => d.valor) ?? [];
};