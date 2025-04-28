import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY!, // usa a chave de Service Role!
);

async function desativarUsuario(userId: string) {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      app_metadata: { disabled: true }
    });
  
    if (error) {
      console.error("Erro ao desativar usuário", error);
      throw new Error(error.message);
    }
  
    return data;
  }

  async function ativarUsuario(userId: string) {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      app_metadata: { disabled: false }
    });
  
    if (error) {
      console.error("Erro ao ativar usuário", error);
      throw new Error(error.message);
    }
  
    return data;
  }
  


  export { supabaseAdmin, desativarUsuario, ativarUsuario };
