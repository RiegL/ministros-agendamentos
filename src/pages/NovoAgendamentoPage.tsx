
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import AgendamentoForm from '@/components/forms/AgendamentoForm';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getDoentes } from '@/services/doentes';
import { getMinistros } from '@/services/ministros';
import { getAgendamentos, addAgendamento } from '@/services/agendamentos';
import { useToast } from '@/hooks/use-toast';
import { Doente, Ministro, Agendamento } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const NovoAgendamentoPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const doenteIdParam = searchParams.get('doenteId');
  const { isAdmin, currentMinistro } = useAuth();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doentes, setDoentes] = useState<Doente[]>([]);
  const [ministros, setMinistros] = useState<Ministro[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
        setIsLoading(true);
        setError(null);
        
        const [doentesData, ministrosData, agendamentosData] = await Promise.all([
          getDoentes(),
          getMinistros(),
          getAgendamentos()
        ]);
        
        // Ensure we're dealing with arrays
        setDoentes(Array.isArray(doentesData) ? doentesData : []);
        setMinistros(Array.isArray(ministrosData) ? ministrosData : []);
        setAgendamentos(Array.isArray(agendamentosData) ? agendamentosData : []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Não foi possível carregar os dados necessários.");
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
  }, [isAdmin, navigate, toast]);
  
  const handleSubmit = async (data: {
    doenteId: string;
    ministroId: string;
    ministroSecundarioId?: string;
    data: Date;
    hora: string;
    observacoes?: string;
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
      console.error("Error submitting appointment:", error);
      toast({
        title: "Erro ao realizar agendamento",
        description: "Não foi possível concluir o agendamento.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Display error message if there's an error
  if (error) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-12">
          <div className="bg-destructive/20 p-4 rounded-md text-center">
            <h2 className="text-xl font-semibold text-destructive">Erro</h2>
            <p className="mt-2">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Se ainda estiver carregando, mostra um indicador
  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto flex flex-col justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p>Carregando dados...</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
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
