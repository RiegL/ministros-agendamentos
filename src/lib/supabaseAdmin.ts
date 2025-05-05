
import { supabase } from '@/integrations/supabase/client';

async function desativarUsuario(userId: string) {
  // Atualizar diretamente a flag disabled na tabela ministros
  const { data, error } = await supabase
    .from('ministros')
    .update({ disabled: true })
    .eq('id', userId)
    .select();
  
  if (error) {
    console.error("Erro ao desativar usuário", error);
    throw new Error(error.message);
  }
  
  return data;
}

async function ativarUsuario(userId: string) {
  // Atualizar diretamente a flag disabled na tabela ministros
  const { data, error } = await supabase
    .from('ministros')
    .update({ disabled: false })
    .eq('id', userId)
    .select();
  
  if (error) {
    console.error("Erro ao ativar usuário", error);
    throw new Error(error.message);
  }
  
  return data;
}

export { desativarUsuario, ativarUsuario };
