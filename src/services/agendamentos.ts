import { supabase } from "@/integrations/supabase/client";
import { Agendamento } from "@/types";

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
  ministroSecundarioId,
  asSecondary = false,
  
}: {
  doenteId: string;
  ministroId: string;
  ministroSecundarioId?: string;
  data: Date;
  hora: string;
  observacoes?: string;
  asSecondary?: boolean;
}): Promise<Agendamento> => {
  if (asSecondary) {
    const { data: existingData } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('doente_id', doenteId)
      .eq('status', 'agendado')
      .is('ministro_secundario_id', null);

    if (existingData && existingData.length > 0) {
      const targetAgendamento = existingData[0];

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

  const { data: newData, error } = await supabase
    .from('agendamentos')
    .insert({
      doente_id: doenteId,
      ministro_id: ministroId,
      ministro_secundario_id: ministroSecundarioId ?? null,
      data: data.toISOString().split('T')[0],
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

export const deleteAgendamento = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('agendamentos')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};
