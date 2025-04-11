
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import AgendamentoForm from '@/components/forms/AgendamentoForm';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { addAgendamento, getDoentes, getMinistros } from '@/services/mock-data';
import { useToast } from '@/hooks/use-toast';
import { Doente, Ministro } from '@/types';

const NovoAgendamentoPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const doenteIdParam = searchParams.get('doenteId');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doentes, setDoentes] = useState<Doente[]>([]);
  const [ministros, setMinistros] = useState<Ministro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doentesData, ministrosData] = await Promise.all([
          getDoentes(),
          getMinistros()
        ]);
        
        setDoentes(doentesData);
        setMinistros(ministrosData);
      } catch (error) {
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar as listas de doentes e ministros.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);
  
  const handleSubmit = async (data: {
    doenteId: string;
    ministroId: string;
    data: Date;
    hora: string;
    observacoes: string;
  }) => {
    setIsSubmitting(true);
    
    try {
      await addAgendamento(data);
      
      toast({
        title: "Agendamento realizado com sucesso",
        description: "A visita foi agendada com sucesso."
      });
      
      navigate('/agendamentos');
    } catch (error) {
      toast({
        title: "Erro ao realizar agendamento",
        description: "Não foi possível concluir o agendamento.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Se ainda estiver carregando, mostra um indicador
  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto flex justify-center items-center py-12">
          <p>Carregando...</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Novo Agendamento</h1>
        <AgendamentoForm 
          doentes={doentes}
          ministros={ministros}
          onSubmit={handleSubmit} 
          isLoading={isSubmitting} 
        />
      </div>
    </Layout>
  );
};

export default NovoAgendamentoPage;
