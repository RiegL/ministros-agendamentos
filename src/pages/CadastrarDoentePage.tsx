
import React from 'react';
import Layout from '@/components/Layout';
import DoentesForm from '@/components/forms/DoentesForm';
import { useNavigate } from 'react-router-dom';
import { addDoente } from '@/services/supabase-data';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { TelefoneDoente } from '@/types';

const CadastrarDoentePage = () => {
  const navigate = useNavigate();
  const { currentMinistro } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (data: {
    nome: string;
    endereco: string;
    setor: string;
    telefone: string;
    telefones: TelefoneDoente[];
    observacoes: string;
  }) => {
    if (!currentMinistro) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para cadastrar doentes.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addDoente({
        ...data,
        cadastradoPor: currentMinistro.id
      });
      
      toast({
        title: "Doente cadastrado com sucesso",
        description: "O doente foi adicionado à lista."
      });
      
      navigate('/doentes');
    } catch (error) {
      toast({
        title: "Erro ao cadastrar doente",
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
        <h1 className="text-3xl font-bold mb-6">Cadastrar Novo Doente</h1>
        <DoentesForm onSubmit={handleSubmit} isLoading={isSubmitting} />
      </div>
    </Layout>
  );
};

export default CadastrarDoentePage;
