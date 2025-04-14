import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useSearchParams } from "react-router-dom";
import {
  getAgendamentos,
  getDoentes,
  getMinistros,
  updateAgendamentoStatus,
  updateAgendamento,
} from "@/services/supabase-data";
import { Agendamento, Doente, Ministro } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import AgendamentosHeader from "@/components/agendamentos/AgendamentosHeader";
import AgendamentosFilters from "@/components/agendamentos/AgendamentosFilters";
import AgendamentosTabs from "@/components/agendamentos/AgendamentosTabs";

const AgendamentosPage = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [doentes, setDoentes] = useState<Doente[]>([]);
  const [ministros, setMinistros] = useState<Ministro[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [ministroFilter, setMinistroFilter] = useState<string>("todos");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const ministroIdParam = searchParams.get("ministroId");
  const { currentMinistro, isAdmin } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [agendamentosData, doentesData, ministrosData] =
          await Promise.all([getAgendamentos(), getDoentes(), getMinistros()]);

        let filteredAgendamentos = agendamentosData;
        if (!isAdmin && currentMinistro) {
          filteredAgendamentos = agendamentosData.filter(
            (a) => a.ministroId === currentMinistro.id || a.ministroSecundarioId === currentMinistro.id
          );
        }

        setAgendamentos(filteredAgendamentos);
        setDoentes(doentesData);
        setMinistros(ministrosData);

        if (ministroIdParam) {
          setMinistroFilter(ministroIdParam);
        } else if (!isAdmin && currentMinistro) {
          setMinistroFilter(currentMinistro.id);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os agendamentos.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast, ministroIdParam, currentMinistro, isAdmin]);

  const handleConcluirAgendamento = async (agendamentoId: string) => {
    try {
      const updatedAgendamento = await updateAgendamentoStatus(
        agendamentoId,
        "concluido"
      );
      setAgendamentos(
        agendamentos.map((a) =>
          a.id === agendamentoId ? updatedAgendamento : a
        )
      );

      toast({
        title: "Agendamento concluído",
        description: "O agendamento foi marcado como concluído com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao concluir agendamento:", error);
      toast({
        title: "Erro ao concluir agendamento",
        description: "Não foi possível concluir o agendamento.",
        variant: "destructive",
      });
    }
  };

  const handleCancelarAgendamento = async (agendamentoId: string) => {
    try {
      const updatedAgendamento = await updateAgendamentoStatus(
        agendamentoId,
        "cancelado"
      );
      setAgendamentos(
        agendamentos.map((a) =>
          a.id === agendamentoId ? updatedAgendamento : a
        )
      );

      toast({
        title: "Agendamento cancelado",
        description: "O agendamento foi cancelado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao cancelar agendamento:", error);
      toast({
        title: "Erro ao cancelar agendamento",
        description: "Não foi possível cancelar o agendamento.",
        variant: "destructive",
      });
    }
  };

  const handleJuntarAgendamento = async (agendamentoId: string) => {
    if (!currentMinistro) return;
    
    try {
      const agendamento = agendamentos.find(a => a.id === agendamentoId);
      
      if (!agendamento) {
        toast({
          title: "Erro",
          description: "Agendamento não encontrado.",
          variant: "destructive",
        });
        return;
      }
      
      if (agendamento.ministroSecundarioId) {
        toast({
          title: "Erro",
          description: "Este agendamento já possui um ministro secundário.",
          variant: "destructive",
        });
        return;
      }
      
      const updatedAgendamento = {
        ...agendamento,
        ministroSecundarioId: currentMinistro.id,
      };
      
      await updateAgendamento(updatedAgendamento);
      
      setAgendamentos(
        agendamentos.map(a => a.id === agendamentoId ? updatedAgendamento : a)
      );
      
      toast({
        title: "Sucesso",
        description: "Você foi adicionado como ministro secundário neste agendamento.",
      });
    } catch (error) {
      console.error("Erro ao juntar-se ao agendamento:", error);
      toast({
        title: "Erro ao juntar-se ao agendamento",
        description: "Não foi possível adicionar você como ministro secundário.",
        variant: "destructive",
      });
    }
  };

  const getDoentePorId = (id: string) => {
    return (
      doentes.find((d) => d.id === id) || {
        id: "",
        nome: "Doente não encontrado",
        endereco: "",
        setor: "",
        telefone: "",
        createdAt: new Date(),
        cadastradoPor: "",
      }
    );
  };

  const getMinistroPorId = (id: string) => {
    return (
      ministros.find((m) => m.id === id) || {
        id: "",
        nome: "Ministro não encontrado",
        email: "",
        telefone: "",
        role: "user" as "admin" | "user",
        senha: "",
        createdAt: new Date(),
      }
    );
  };

  const filteredAgendamentos = agendamentos.filter((agendamento) => {
    const doente = getDoentePorId(agendamento.doenteId);
    const ministro = getMinistroPorId(agendamento.ministroId);

    const matchesSearch =
      doente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ministro.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doente.setor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "todos" || agendamento.status === statusFilter;

    let matchesMinistro = true;
    if (ministroFilter !== "todos") {
      matchesMinistro = 
        agendamento.ministroId === ministroFilter || 
        agendamento.ministroSecundarioId === ministroFilter;
    }

    return matchesSearch && matchesStatus && matchesMinistro;
  });

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <AgendamentosHeader isAdmin={isAdmin} />

        <AgendamentosFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          ministroFilter={ministroFilter}
          setMinistroFilter={setMinistroFilter}
          ministros={ministros}
          isAdmin={isAdmin}
        />

        <AgendamentosTabs
          filteredAgendamentos={filteredAgendamentos}
          doentes={doentes}
          ministros={ministros}
          isLoading={isLoading}
          isAdmin={isAdmin}
          onConcluir={handleConcluirAgendamento}
          onCancelar={handleCancelarAgendamento}
          onJuntar={handleJuntarAgendamento}
        />
      </div>
    </Layout>
  );
};

export default AgendamentosPage;
