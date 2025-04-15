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
    id_auth: item.id_auth,
    nome: item.nome,
    email: item.email,
    telefone: item.telefone,
    role: item.role as 'admin' | 'user',
    senha: item.senha,
    createdAt: new Date(item.created_at)
  }));
};

export const addMinistro = async (ministro: Omit<Ministro, 'id' | 'createdAt'>): Promise<Ministro> => {
  const { data, error } = await supabase
    .from('ministros')
    .insert({
      id_auth: uuidv4(),
      nome: ministro.nome,
      email: ministro.email,
      telefone: ministro.telefone,
      role: ministro.role,
      senha: ministro.senha
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    id_auth: data.id_auth,
    nome: data.nome,
    email: data.email,
    telefone: data.telefone,
    role: data.role as 'admin' | 'user',
    senha: data.senha,
    createdAt: new Date(data.created_at)
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

export const deleteMinistro = async (id: string): Promise<void> => {
  const temAgendamentos = await hasAgendamentosAssociados(id);
  
  if (temAgendamentos) {
    throw new Error("Não é possível excluir este ministro porque existem agendamentos associados a ele.");
  }
  
  const { error } = await supabase
    .from('ministros')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
