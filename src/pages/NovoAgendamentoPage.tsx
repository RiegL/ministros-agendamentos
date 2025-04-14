
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import AgendamentoForm from '@/components/forms/AgendamentoForm';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { addAgendamento, getDoentes, getMinistros, getAgendamentos } from '@/services/supabase-data';
import { useToast } from '@/hooks/use-toast';
import { Doente, Ministro, Agendamento } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const NovoAgendamentoPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const doenteIdParam = searchParams.get('doenteId');
  const { isAdmin, currentMinistro } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doentes, setDoentes] = useState<Doente[]>([]);
  const [ministros, setMinistros] = useState<Ministro[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Verify that the user has permission to access this page
    if (!isAdmin) {
      toast({
        title: "Acesso restrito",
        description: "Apenas administradores podem criar agendamentos para outros ministros.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    
    const fetchData = async () => {
      try {
        const [doentesData, ministrosData, agendamentosData] = await Promise.all([
          getDoentes(),
          getMinistros(),
          getAgendamentos()
        ]);
        
        setDoentes(doentesData);
        setMinistros(ministrosData);
        setAgendamentos(agendamentosData);
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
  }, [isAdmin, navigate]);
  
  const handleSubmit = async (data: {
    doenteId: string;
    ministroId: string;
    ministroSecundarioId?: string;
    data: Date;
    hora: string;
    observacoes: string;
  }) => {
    setIsSubmitting(true);
    
    try {
      // Check if doente already has a pending appointment
      const doenteHasPendingAppointment = agendamentos.some(
        agendamento => 
          agendamento.doenteId === data.doenteId && 
          agendamento.status === 'agendado'
      );
      
      if (doenteHasPendingAppointment) {
        toast({
          title: "Doente já possui agendamento",
          description: "Este doente já possui uma visita agendada que ainda não foi concluída.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
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
