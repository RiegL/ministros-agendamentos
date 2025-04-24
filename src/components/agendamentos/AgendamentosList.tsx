
import React from "react";
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { Agendamento, Doente, Ministro } from "@/types";
import AgendamentoCard from "@/components/cards/AgendamentoCard";

interface AgendamentosListProps {
  agendamentos: Agendamento[];
  doentes: Doente[];
  ministros: Ministro[];
  isLoading: boolean;
  isAdmin: boolean;
  onConcluir: (agendamentoId: string) => void;
  onCancelar: (agendamentoId: string) => void;
  onJuntar: (agendamentoId: string) => void;
  onDelete?: (agendamentoId: string) => void;
}

const AgendamentosList = ({
  agendamentos,
  doentes,
  ministros,
  isLoading,
  isAdmin,
  onConcluir,
  onCancelar,
  onJuntar,
  onDelete,
}: AgendamentosListProps) => {
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
        codigo: 0,
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p>Carregando...</p>
      </div>
    );
  }

  if (agendamentos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground mb-4">
          Nenhum agendamento encontrado.
        </p>
        {isAdmin && (
          <Button asChild>
            <Link to="/novo-agendamento">
              <CalendarPlus className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {agendamentos.map((agendamento) => {
        const ministroSecundario = agendamento.ministroSecundarioId
          ? getMinistroPorId(agendamento.ministroSecundarioId)
          : null;

        return (
          <AgendamentoCard
            key={agendamento.id}
            agendamento={agendamento}
            doente={getDoentePorId(agendamento.doenteId)}
            ministro={getMinistroPorId(agendamento.ministroId)}
            ministroSecundario={ministroSecundario}
            onConcluir={onConcluir}
            onCancelar={onCancelar}
            onJuntar={onJuntar}
            onDelete={isAdmin ? onDelete : undefined}
          />
        );
      })}
    </div>
  );
};

export default AgendamentosList;
