
import React from "react";
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import { Link } from "react-router-dom";

interface AgendamentosHeaderProps {
  isAdmin: boolean;
}

const AgendamentosHeader = ({ isAdmin }: AgendamentosHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
        <p className="text-muted-foreground">
          Gerencie todos os agendamentos de visitas a doentes.
        </p>
      </div>
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
};

export default AgendamentosHeader;
