import { supabase } from "@/integrations/supabase/client";
import { Doente, TelefoneDoente } from "@/types";

export const getDoentes = async (): Promise<Doente[]> => {
  // Pega todos os doentes
  const { data: doentesData, error: doentesError } = await supabase
    .from("doentes")
    .select("*");
  if (doentesError) throw doentesError;

  // Pega todos os telefones relacionados
  const { data: telefonesData, error: telefonesError } = await supabase
    .from("telefones_doente")
    .select("*");
  if (telefonesError) throw telefonesError;

  // Mapeia cada doente já com seu array de telefones
  return doentesData.map((d) => {
    const telefones = telefonesData
      .filter((t) => t.doente_id === d.id)
      .map<TelefoneDoente>((t) => ({
        numero: t.numero,
        descricao: t.descricao || undefined,
      }));
    return {
      id: d.id,
      nome: d.nome,
      endereco: d.endereco,
      setor: d.setor,
      telefones: telefones,
      observacoes: d.observacoes ?? undefined,
      createdAt: new Date(d.created_at),
      cadastradoPor: d.cadastrado_por,
      latitude: d.latitude,
      longitude: d.longitude,
    };
  });
};

export const addDoente = async (
  doente: Omit<Doente, "id" | "createdAt">
): Promise<Doente> => {
  // Insere apenas os dados principais (sem telefone)
  const { data: d, error } = await supabase
    .from("doentes")
    .insert({
      nome: doente.nome,
      endereco: doente.endereco,
      setor: doente.setor,
      observacoes: doente.observacoes,
      cadastrado_por: doente.cadastradoPor,
      latitude: doente.latitude,
      longitude: doente.longitude,
    })
    .select()
    .single();
  if (error) throw error;

  // Agora insere TODOS os telefones (inclusive o principal, se quiser)
  if (doente.telefones.length > 0) {
    const telefonesParaInserir = doente.telefones.map((tel) => ({
      doente_id: d.id,
      numero: tel.numero,
      descricao: tel.descricao ?? "",
    }));
    const { error: telError } = await supabase
      .from("telefones_doente")
      .insert(telefonesParaInserir);
    if (telError) throw telError;
  }

  return {
    id: d.id,
    nome: d.nome,
    endereco: d.endereco,
    setor: d.setor,
    // telefones: doente.telefones,
    observacoes: d.observacoes ?? undefined,
    createdAt: new Date(d.created_at),
    cadastradoPor: d.cadastrado_por,
    latitude: d.latitude,
    longitude: d.longitude,
  };
};

export const updateDoente = async (doente: Doente): Promise<Doente> => {
  console.log("🔁 Iniciando update de doente:", doente.id);

  // 1. Atualiza apenas os dados da tabela `doentes`
  const { data: d, error } = await supabase
    .from("doentes")
    .update({
      nome: doente.nome,
      endereco: doente.endereco,
      setor: doente.setor,
      observacoes: doente.observacoes,
      latitude: doente.latitude,
      longitude: doente.longitude,
    })
    .eq("id", doente.id)
    .select()
    .single();

  if (error) throw error;
  console.log("✅ Doente atualizado:", d.id);

  // 2. Deleta os telefones antigos
  const { data: deleted, error: deleteError } = await supabase
    .from("telefones_doente")
    .delete()
    .eq("doente_id", doente.id)
    .select();
  console.log(`🗑️ Telefones deletados:`, deleted);

  if (deleteError) {
    console.error("❌ Erro ao deletar telefones antigos:", deleteError);
    throw deleteError;
  }
  console.log("🗑️ Telefones antigos removidos com sucesso");

  // 3. Insere os novos telefones (se houver)
  const validTelefones = doente.telefones.filter((t) => t.numero.trim() !== "");
  if (validTelefones.length > 0) {
    const telefonesParaInserir = validTelefones.map((tel) => ({
      doente_id: doente.id,
      numero: tel.numero,
      descricao: tel.descricao ?? "",
    }));

    const { error: telError } = await supabase
      .from("telefones_doente")
      .insert(telefonesParaInserir);

    if (telError) {
      console.error("❌ Erro ao inserir novos telefones:", telError);
      throw telError;
    }

    console.log("✅ Telefones inseridos com sucesso");
  }

  return {
    id: d.id,
    nome: d.nome,
    endereco: d.endereco,
    setor: d.setor,
    telefones: validTelefones,
    observacoes: d.observacoes ?? undefined,
    createdAt: new Date(d.created_at),
    cadastradoPor: d.cadastrado_por,
    latitude: d.latitude,
    longitude: d.longitude,
  };
};

export const deleteDoente = async (id: string): Promise<void> => {
  // Opcional: primeiro delete telefones (para manter integridade)
  await supabase.from("telefones_doente").delete().eq("doente_id", id);
  const { error } = await supabase.from("doentes").delete().eq("id", id);
  if (error) throw error;
};

export const hasActiveScheduling = async (
  doenteId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from("agendamentos")
    .select("id")
    .eq("doente_id", doenteId)
    .eq("status", "agendado");
  if (error) throw error;
  return data.length > 0;
};

export const getActiveScheduling = async (doenteId: string) => {
  const { data, error } = await supabase
    .from("agendamentos")
    .select("*")
    .eq("doente_id", doenteId)
    .eq("status", "agendado")
    .single();
  if (error && error.code !== "PGRST116") throw error;
  if (!data) return null;
  return {
    id: data.id,
    doenteId: data.doente_id,
    ministroId: data.ministro_id,
    ministroSecundarioId: data.ministro_secundario_id ?? undefined,
    data: new Date(data.data),
    hora: data.hora,
    status: data.status as "agendado" | "concluido" | "cancelado",
    observacoes: data.observacoes ?? undefined,
    createdAt: new Date(data.created_at),
  };
};
