
import React from 'react';
import Layout from '@/components/Layout';
import MinistrosForm from '@/components/forms/MinistrosForm';
import { useNavigate } from 'react-router-dom';
import { addMinistro } from '@/services/supabase-data';
import { useToast } from '@/hooks/use-toast';

const CadastrarMinistroPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (data: {
    nome: string;
    email: string;
    telefone: string;
    senha: string;
    role: 'admin' | 'user';
  }) => {
    setIsSubmitting(true);
    
    try {
      await addMinistro(data);
      
      toast({
        title: "Ministro cadastrado com sucesso",
        description: "O ministro foi adicionado à lista."
      });
      
      navigate('/ministros');
    } catch (error) {
      toast({
        title: "Erro ao cadastrar ministro",
        description: "Não foi possível concluir o cadastro.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Cadastrar Novo Ministro</h1>
        <MinistrosForm onSubmit={handleSubmit} isLoading={isSubmitting} />
      </div>
    </Layout>
  );
};

export default CadastrarMinistroPage;
