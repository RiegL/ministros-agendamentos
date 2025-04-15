import { supabase } from "@/integrations/supabase/client";
import { Doente } from "@/types";

export const getDoentes = async (): Promise<Doente[]> => {
  const { data: doentesData, error: doentesError } = await supabase
    .from('doentes')
    .select('*');

  if (doentesError) throw doentesError;

  const { data: telefonesData, error: telefonesError } = await supabase
    .from('telefones_doente')
    .select('*');

  if (telefonesError) throw telefonesError;

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

export const hasActiveScheduling = async (doenteId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('agendamentos')
    .select('id')
    .eq('doente_id', doenteId)
    .eq('status', 'agendado');

  if (error) throw error;

  return data.length > 0;
};
