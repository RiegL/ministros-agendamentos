import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import Layout from '@/components/Layout';
import DoentesForm from '@/components/forms/DoentesForm';
import { getDoentes, updateDoente } from '@/services/doentes';
import { Doente } from '@/types';

const EditarDoentePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient(); // Acesso ao cliente de consulta do React Query

  const { data: doentes, isLoading, refetch } = useQuery({
    queryKey: ['doentes'],
    queryFn: getDoentes
  });

  const doente = doentes?.find((d) => d.id === id);

  const handleSubmit = async (data: Partial<Doente>) => {
    if (!doente?.id) {
      toast({
        title: 'Erro',
        description: 'Doente não encontrado.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const updatedTelefones = data.telefones
        ? data.telefones.filter((tel) => tel.numero.trim() !== '')
        : [];

      await updateDoente({
        id: doente.id,
        nome: data.nome ?? doente.nome,
        endereco: data.endereco ?? doente.endereco,
        setor: data.setor ?? doente.setor,
        observacoes: data.observacoes ?? doente.observacoes,
        latitude: data.latitude ?? doente.latitude,
        longitude: data.longitude ?? doente.longitude,
        telefones: updatedTelefones,
        cadastradoPor: doente.cadastradoPor,
        createdAt: doente.createdAt,
      });

      // Invalidar a consulta para refazer a busca de doentes
      queryClient.invalidateQueries({ queryKey: ['doentes'] });

      // Refazer a consulta imediatamente
      await refetch();

      toast({
        title: 'Doente atualizado',
        description: 'As informações foram salvas com sucesso.',
      });

      // Redirecionar para a lista de doentes após a atualização
      navigate('/doentes');
    } catch (error) {
      console.error('Erro ao atualizar doente:', error);
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar as informações do doente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {isLoading && <p>Carregando informações do doente...</p>}

        {!isLoading && !doente && (
          <p className="text-red-500 font-medium">Doente não encontrado.</p>
        )}

        {!isLoading && doente && (
          <DoentesForm
            doente={doente}
            onSubmit={handleSubmit}
            isLoading={false}
          />
        )}
      </div>
    </Layout>
  );
};

export default EditarDoentePage;
