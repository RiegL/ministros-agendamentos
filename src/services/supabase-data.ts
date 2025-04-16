
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { Agendamento, Doente, Ministro, TelefoneDoente } from "@/types";

// Funções para Ministros
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
    createdAt: new Date(item.created_at)
  }));
};

export const addMinistro = async (ministro: Omit<Ministro, 'id' | 'createdAt'>): Promise<Ministro> => {
  const { data, error } = await supabase
    .from('ministros')
    .insert({
      id_auth: ministro.idAuth || uuidv4(), 
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
    idAuth: data.id_auth,
    nome: data.nome,
    email: data.email,
    telefone: data.telefone,
    role: data.role as 'admin' | 'user',
    senha: data.senha,
    createdAt: new Date(data.created_at)
  };
};

// Funções para Doentes
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

// Funções para Agendamentos
export const getAgendamentos = async (): Promise<Agendamento[]> => {
  const { data, error } = await supabase
    .from('agendamentos')
    .select('*');
  
  if (error) throw error;
  
  return data.map(item => ({
    id: item.id,
    doenteId: item.doente_id,
    ministroId: item.ministro_id,
    ministroSecundarioId: item.ministro_secundario_id || undefined,
    data: new Date(item.data),
    hora: item.hora,
    status: item.status as 'agendado' | 'concluido' | 'cancelado',
    observacoes: item.observacoes,
    createdAt: new Date(item.created_at)
  }));
};

export const addAgendamento = async ({
  doenteId,
  ministroId,
  data,
  hora,
  observacoes,
  asSecondary = false
}: {
  doenteId: string;
  ministroId: string;
  data: Date;
  hora: string;
  observacoes?: string;
  asSecondary?: boolean;
}): Promise<Agendamento> => {
  
  // Se é para adicionar como ministro secundário, encontrar agendamento existente
  if (asSecondary) {
    const { data: existingData } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('doente_id', doenteId)
      .eq('status', 'agendado')
      .is('ministro_secundario_id', null);
    
    if (existingData && existingData.length > 0) {
      const targetAgendamento = existingData[0];
      
      // Atualizar o agendamento com o ministro secundário
      const { data: updatedData, error } = await supabase
        .from('agendamentos')
        .update({ ministro_secundario_id: ministroId })
        .eq('id', targetAgendamento.id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: updatedData.id,
        doenteId: updatedData.doente_id,
        ministroId: updatedData.ministro_id,
        ministroSecundarioId: updatedData.ministro_secundario_id,
        data: new Date(updatedData.data),
        hora: updatedData.hora,
        status: updatedData.status as 'agendado' | 'concluido' | 'cancelado',
        observacoes: updatedData.observacoes,
        createdAt: new Date(updatedData.created_at)
      };
    }
  }
  
  // Caso contrário, criar um novo agendamento
  const { data: newData, error } = await supabase
    .from('agendamentos')
    .insert({
      doente_id: doenteId,
      ministro_id: ministroId,
      data: data.toISOString().split('T')[0], // Formato YYYY-MM-DD
      hora,
      status: 'agendado',
      observacoes
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: newData.id,
    doenteId: newData.doente_id,
    ministroId: newData.ministro_id,
    ministroSecundarioId: newData.ministro_secundario_id || undefined,
    data: new Date(newData.data),
    hora: newData.hora,
    status: newData.status as 'agendado' | 'concluido' | 'cancelado',
    observacoes: newData.observacoes,
    createdAt: new Date(newData.created_at)
  };
};

export const updateAgendamentoStatus = async (
  id: string,
  status: Agendamento["status"]
): Promise<Agendamento> => {
  const { data, error } = await supabase
    .from('agendamentos')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  
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

export const deleteDoente = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('doentes')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
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

export const updateAgendamento = async (agendamento: Agendamento): Promise<Agendamento> => {
  const { data, error } = await supabase
    .from('agendamentos')
    .update({
      doente_id: agendamento.doenteId,
      ministro_id: agendamento.ministroId,
      ministro_secundario_id: agendamento.ministroSecundarioId,
      data: new Date(agendamento.data).toISOString().split('T')[0],
      hora: agendamento.hora,
      status: agendamento.status,
      observacoes: agendamento.observacoes
    })
    .eq('id', agendamento.id)
    .select()
    .single();
  
  if (error) throw error;
  
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
