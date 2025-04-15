import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { Doente, TelefoneDoente } from "@/types";

export const getDoentes = async (): Promise<Doente[]> => {
  const { data: doentesData, error: doentesError } = await supabase
    .from('doentes')
    .select('*');
  
  if (doentesError) throw doentesError;
  
  // Buscar todos os telefones de doentes
  const { data: telefonesData, error: telefonesError } = await supabase
    .from('telefones_doente')
    .select('*');
  
  if (telefonesError) throw telefonesError;
  
  // Mapear os telefones para os doentes
  return doentesData.map(doente => {
    const telefones = telefonesData
      .filter(tel => tel.doente_id === doente.id)
      .map(tel => ({
        numero: tel.numero,
        descricao: tel.descricao
      }));
    
    return {
      id: doente.id,
      nome: doente.nome,
      endereco: doente.endereco,
      setor: doente.setor,
      telefone: doente.telefone,
      telefones: telefones.length > 0 ? telefones : undefined,
      observacoes: doente.observacoes,
      createdAt: new Date(doente.created_at),
      cadastradoPor: doente.cadastrado_por
    };
  });
};

export const addDoente = async (doente: Omit<Doente, 'id' | 'createdAt'>): Promise<Doente> => {
  // Primeiro, inserir o doente
  const { data, error } = await supabase
    .from('doentes')
    .insert({
      nome: doente.nome,
      endereco: doente.endereco,
      setor: doente.setor,
      telefone: doente.telefone,
      observacoes: doente.observacoes,
      cadastrado_por: doente.cadastradoPor
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Depois, inserir os telefones (se houver)
  if (doente.telefones && doente.telefones.length > 0) {
    const telefonesParaInserir = doente.telefones.map(tel => ({
      doente_id: data.id,
      numero: tel.numero,
      descricao: tel.descricao
    }));
    
    const { error: telError } = await supabase
      .from('telefones_doente')
      .insert(telefonesParaInserir);
    
    if (telError) throw telError;
  }
  
  return {
    id: data.id,
    nome: data.nome,
    endereco: data.endereco,
    setor: data.setor,
    telefone: data.telefone,
    telefones: doente.telefones,
    observacoes: data.observacoes,
    createdAt: new Date(data.created_at),
    cadastradoPor: data.cadastrado_por
  };
};

export const deleteDoente = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('doentes')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const updateDoente = async (doente: Doente): Promise<Doente> => {
  const { data, error } = await supabase
    .from('doentes')
    .update({
      nome: doente.nome,
      endereco: doente.endereco,
      setor: doente.setor,
      telefone: doente.telefone,
      observacoes: doente.observacoes,
      latitude: doente.latitude,
      longitude: doente.longitude
    })
    .eq('id', doente.id)
    .select()
    .single();
  
  if (error) throw error;

  // Se houver telefones, atualizar também
  if (doente.telefones && doente.telefones.length > 0) {
    // Primeiro, remover todos os telefones existentes para este doente
    await supabase
      .from('telefones_doente')
      .delete()
      .eq('doente_id', doente.id);

    // Depois, inserir novos telefones
    const telefonesParaInserir = doente.telefones.map(tel => ({
      doente_id: doente.id,
      numero: tel.numero,
      descricao: tel.descricao
    }));
    
    const { error: telError } = await supabase
      .from('telefones_doente')
      .insert(telefonesParaInserir);
    
    if (telError) throw telError;
  }
  
  return {
    id: data.id,
    nome: data.nome,
    endereco: data.endereco,
    setor: data.setor,
    telefone: data.telefone,
    telefones: doente.telefones,
    observacoes: data.observacoes,
    createdAt: new Date(data.created_at),
    cadastradoPor: data.cadastrado_por,
    latitude: data.latitude,
    longitude: data.longitude
  };
};

export const hasActiveScheduling = async (doenteId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('agendamentos')
    .select('id')
    .eq('doente_id', doenteId)
    .eq('status', 'agendado');
  
  if (error) throw error;
  
  return data.length > 0;
};

export const getActiveScheduling = async (doenteId: string) => {
  const { data, error } = await supabase
    .from('agendamentos')
    .select('*')
    .eq('doente_id', doenteId)
    .eq('status', 'agendado')
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // Não encontrou agendamento
      return null;
    }
    throw error;
  }
  
  return {
    id: data.id,
    doenteId: data.doente_id,
    ministroId: data.ministro_id,
    ministroSecundarioId: data.ministro_secundario_id || undefined,
    data: new Date(data.data),
    hora: data.hora,
    status: data.status as 'agendado' | 'concluido' | 'cancelado',
    observacoes: data.observacoes,
    createdAt: new Date(data.created_at)
  };
};
