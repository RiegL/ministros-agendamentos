
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { Ministro } from "@/types";

export const getMinistros = async (): Promise<Ministro[]> => {
  const { data, error } = await supabase
    .from('ministros')
    .select('*');

  if (error) throw error;

  return data.map(item => ({
    id: item.id,
    idAuth: item.id_auth,
    nome: item.nome,
    email: item.email,
    telefone: item.telefone,
    role: item.role as 'admin' | 'user',
    senha: item.senha,
    createdAt: new Date(item.created_at),
    codigo: item.codigo,
    disabled: item.disabled,
  }));
};

export const addMinistro = async (ministro: Omit<Ministro, 'id' | 'createdAt'>): Promise<Ministro> => {
  const { data, error } = await supabase
    .from('ministros')
    .insert({
      id_auth: ministro.idAuth,
      nome: ministro.nome,
      email: ministro.email,
      telefone: ministro.telefone,
      role: ministro.role,
      senha: ministro.senha,
      codigo: ministro.codigo,
      disabled: ministro.disabled ?? false,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    idAuth: data.id_auth,
    nome: data.nome,
    email: data.email,
    telefone: data.telefone,
    role: data.role as 'admin' | 'user',
    senha: data.senha,
    createdAt: new Date(data.created_at),
    codigo: data.codigo,
    disabled: data.disabled,
  };
};

export const hasAgendamentosAssociados = async (ministroId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('agendamentos')
    .select('id')
    .or(`ministro_id.eq.${ministroId},ministro_secundario_id.eq.${ministroId}`)
    .limit(1);
  
  if (error) throw error;
  
  return data.length > 0;
};

export const deleteMinistro = async (id: string) => {
  // Deletar apenas da tabela ministros
  const { error: deleteError } = await supabase
    .from('ministros')
    .delete()
    .eq('id', id);

  if (deleteError) {
    throw new Error(deleteError.message);
  }
};

export const updateMinistro = async (ministro: Ministro): Promise<Ministro> => {
  const { data, error } = await supabase
    .from("ministros")
    .update({
      nome: ministro.nome,
      email: ministro.email,
      telefone: ministro.telefone,
      role: ministro.role,
      senha: ministro.senha,
      codigo: ministro.codigo,
      disabled: ministro.disabled
    })
    .eq("id", ministro.id)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    idAuth: data.id_auth,
    nome: data.nome,
    email: data.email,
    telefone: data.telefone,
    role: data.role as "admin" | "user",
    senha: data.senha,
    createdAt: new Date(data.created_at),
    codigo: data.codigo,
    disabled: data.disabled
  };
};

export const getMinistroById = async (id: string): Promise<Ministro> => {
  const { data, error } = await supabase
    .from('ministros')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    idAuth: data.id_auth,
    nome: data.nome,
    email: data.email,
    telefone: data.telefone,
    role: data.role as 'admin' | 'user',
    senha: data.senha,
    createdAt: new Date(data.created_at),
    codigo: data.codigo,
    disabled: data.disabled
  };
};
