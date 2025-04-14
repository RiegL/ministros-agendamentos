
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Agendamento, Doente, Ministro } from "@/types";
import AgendamentosList from "./AgendamentosList";

interface AgendamentosTabsProps {
  filteredAgendamentos: Agendamento[];
  doentes: Doente[];
  ministros: Ministro[];
  isLoading: boolean;
  isAdmin: boolean;
  onConcluir: (agendamentoId: string) => void;
  onCancelar: (agendamentoId: string) => void;
  onJuntar: (agendamentoId: string) => void;
}

const AgendamentosTabs = ({
  filteredAgendamentos,
  doentes,
  ministros,
  isLoading,
  isAdmin,
  onConcluir,
  onCancelar,
  onJuntar,
}: AgendamentosTabsProps) => {
  return (
    <Tabs defaultValue="todos" className="w-full">
      <TabsList className="grid grid-cols-3 w-full max-w-md mb-4">
        <TabsTrigger value="todos">Todos</TabsTrigger>
        <TabsTrigger value="proximos">Próximos</TabsTrigger>
        <TabsTrigger value="passados">Passados</TabsTrigger>
      </TabsList>

      <TabsContent value="todos">
        <AgendamentosList
          agendamentos={filteredAgendamentos}
          doentes={doentes}
          ministros={ministros}
          isLoading={isLoading}
          isAdmin={isAdmin}
          onConcluir={onConcluir}
          onCancelar={onCancelar}
          onJuntar={onJuntar}
        />
      </TabsContent>

      <TabsContent value="proximos">
        <AgendamentosList
          agendamentos={filteredAgendamentos.filter(
            (a) => new Date(a.data) >= new Date()
          )}
          doentes={doentes}
          ministros={ministros}
          isLoading={isLoading}
          isAdmin={isAdmin}
          onConcluir={onConcluir}
          onCancelar={onCancelar}
          onJuntar={onJuntar}
        />
      </TabsContent>

      <TabsContent value="passados">
        <AgendamentosList
          agendamentos={filteredAgendamentos.filter(
            (a) => new Date(a.data) < new Date()
          )}
          doentes={doentes}
          ministros={ministros}
          isLoading={isLoading}
          isAdmin={isAdmin}
          onConcluir={onConcluir}
          onCancelar={onCancelar}
          onJuntar={onJuntar}
        />
      </TabsContent>
    </Tabs>
  );
};

export default AgendamentosTabs;
