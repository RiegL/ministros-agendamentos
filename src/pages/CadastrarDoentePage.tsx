
import React from 'react';
import Layout from '@/components/Layout';
import DoentesForm from '@/components/forms/DoentesForm';
import { useNavigate } from 'react-router-dom';
import { addDoente } from '@/services/mock-data';
import { useToast } from '@/hooks/use-toast';

const CadastrarDoentePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const handleSubmit = async (data: {
    nome: string;
    endereco: string;
    telefone: string;
    observacoes: string;
  }) => {
    setIsSubmitting(true);
    
    try {
      // Simulando o ID do ministro logado
      const ministroId = '1';
      
      await addDoente({
        ...data,
        cadastradoPor: ministroId
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
