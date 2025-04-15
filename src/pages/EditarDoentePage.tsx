
import React from 'react';
import Layout from '@/components/Layout';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { updateDoente } from '@/services/doentes';
import { Doente } from '@/types';
import DoentesForm from '@/components/forms/DoentesForm';
import { useQuery } from '@tanstack/react-query';
import { getDoentes } from '@/services/doentes';

const EditarDoentePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: doentes } = useQuery({
    queryKey: ['doentes'],
    queryFn: getDoentes
  });

  const doente = doentes?.find(d => d.id === id);

  const handleSubmit = async (data: Partial<Doente>) => {
    if (!doente) return;
    
    try {
      await updateDoente({
        ...doente,
        ...data
      });
      
      toast({
        title: "Doente atualizado",
        description: "As informações foram atualizadas com sucesso."
      });
      
      navigate('/doentes');
    } catch (error) {
      console.error('Erro ao atualizar doente:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar as informações do doente.",
        variant: "destructive"
      });
    }
  };

  if (!doente) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p>Doente não encontrado.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Editar Doente</h1>
        <DoentesForm
          doente={doente}
          onSubmit={handleSubmit}
        />
      </div>
    </Layout>
  );
};

export default EditarDoentePage;
