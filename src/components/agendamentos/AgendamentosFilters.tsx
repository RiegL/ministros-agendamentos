
import React from "react";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ministro } from "@/types";

interface AgendamentosFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  ministroFilter: string;
  setMinistroFilter: (ministroId: string) => void;
  ministros: Ministro[];
  isAdmin: boolean;
}

const AgendamentosFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  ministroFilter,
  setMinistroFilter,
  ministros,
  isAdmin,
}: AgendamentosFiltersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar agendamentos..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <div className="flex items-center gap-2 flex-1">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="agendado">Agendados</SelectItem>
              <SelectItem value="concluido">Concluídos</SelectItem>
              <SelectItem value="cancelado">Cancelados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isAdmin && (
          <div className="flex-1">
            <Select value={ministroFilter} onValueChange={setMinistroFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por ministro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os ministros</SelectItem>
                {ministros.map((ministro) => (
                  <SelectItem key={ministro.id} value={ministro.id}>
                    {ministro.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgendamentosFilters;
