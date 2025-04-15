import { createClient } from '@supabase/supabase-js';

// Substitua os valores abaixo com os dados do seu projeto Supabase:
const SUPABASE_URL = "https://juahafdtttezrwyinbkz.supabase.co";
// Use a sua Service Role Key – ela tem permissões elevadas e NÃO deve ser exposta no frontend
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1YWhhZmR0dHRlenJ3eWluYmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzA5NjksImV4cCI6MjA1OTk0Njk2OX0.bo53ijbNFLGobJ-LtPNjVFV5fBHiTCIgyX1HV2INoCA';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createDefaultAdmin() {
  // Dados do admin padrão — personalize conforme necessário
  const defaultAdminEmail = "leoorieg@gmail.com";
  const defaultAdminPassword = "123123"; // Troque essa senha assim que possível
  const defaultAdminNome = "Administrador";
  const defaultAdminTelefone = "0000000000";

  // Verifica se já existe um ministro com esse email na tabela
  const { data: existingAdmin, error: checkError } = await supabase
    .from('ministros')
    .select('*')
    .eq('email', defaultAdminEmail)
    .maybeSingle();

  if (checkError) {
    console.error("Erro ao verificar admin existente:", checkError);
    return;
  }

  if (existingAdmin) {
    console.log("O admin padrão já existe:", existingAdmin);
    return;
  }

  // Cria o usuário no Supabase Auth
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: defaultAdminEmail,
    password: defaultAdminPassword,
  });

  if (signUpError || !authData?.user) {
    console.error("Erro ao criar usuário no Auth:", signUpError);
    return;
  }

  // Insere os dados do admin na tabela "ministros"
  const { error: insertError } = await supabase
    .from('ministros')
    .insert({
      nome: defaultAdminNome,
      email: defaultAdminEmail,
      telefone: defaultAdminTelefone,
      senha: defaultAdminPassword,  // Lembre-se: senha em plaintext só para exemplo!
      role: 'admin',
      id_auth: authData.user.id,
    });

  if (insertError) {
    console.error("Erro ao inserir administrador na tabela 'ministros':", insertError);
    return;
  }

  console.log("Admin padrão criado com sucesso!");
}

// Executa o script
createDefaultAdmin();
