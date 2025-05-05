import React from 'react';
import Layout from '@/components/Layout';
import MinistrosForm from '@/components/forms/MinistrosForm';
import { useNavigate } from 'react-router-dom';
import { addMinistro } from '@/services/ministros';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/services/supabase-client';


const CadastrarMinistroPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (data: {
    nome: string;
    email: string;
    telefone: string;
    senha: string;
    codigo: number;
    role: 'admin' | 'user';
  }) => {
    setIsSubmitting(true);
    
    try {
      // 1. Cria o usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.senha,
      });

      if (authError || !authData?.user?.id) {
        throw new Error(authError?.message || 'Erro ao criar usuário no Auth');
      }

      const idAuth = authData.user.id;

      // 2. Depois adiciona no ministros
      await addMinistro({
        idAuth,
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        senha: data.senha,
        codigo: data.codigo,
        role: data.role,
      });
      
      toast({
        title: "Ministro cadastrado com sucesso",
        description: "O ministro foi adicionado à lista. Confirme o email para ativar a conta."
      });
      
      navigate('/ministros');
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar ministro",
        description: error.message || "Não foi possível concluir o cadastro.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <MinistrosForm onSubmit={handleSubmit} isLoading={isSubmitting} />
      </div>
    </Layout>
  );
};

export default CadastrarMinistroPage;
