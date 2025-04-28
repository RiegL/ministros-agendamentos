
import React from 'react';
import Layout from '@/components/Layout';
import MinistrosForm from '@/components/forms/MinistrosForm';
import { useNavigate } from 'react-router-dom';
import { addMinistro } from '@/services/ministros';
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
      const ministroData = {
        ...data,
        idAuth: generateIdAuth(),
        codigo: generateCodigo(), // Add the missing 'codigo' property
      };

      await addMinistro(ministroData);
      
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

  const generateIdAuth = () => {
    return Math.random().toString(36).substring(2, 15); // Example implementation
  };
  const generateCodigo = () => {
    return Math.floor(1000 + Math.random() * 9000); // Example implementation for 'codigo'
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
