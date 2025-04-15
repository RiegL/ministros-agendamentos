
import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { getDoentes } from '@/services/doentes';
import { getMinistros } from '@/services/ministros';
import { getAgendamentos } from '@/services/agendamentos';
import { Agendamento, Doente, Ministro } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import ReportsFilters from "@/components/reports/ReportsFilters";

const RelatoriosPage = () => {
  const { toast } = useToast();
  const { isAdmin, currentMinistro } = useAuth();

  // Data states
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [doentes, setDoentes] = useState<Doente[]>([]);
  const [ministros, setMinistros] = useState<Ministro[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [nomeFiltro, setNomeFiltro] = useState("");
  const [setorFiltro, setSetorFiltro] = useState("todos");
  const [dataFiltro, setDataFiltro] = useState<Date | undefined>(undefined);
  const [ministroFiltro, setMinistroFiltro] = useState("todos");

  // Combined data
  const [relatorios, setRelatorios] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agendamentosData, doentesData, ministrosData] =
          await Promise.all([getAgendamentos(), getDoentes(), getMinistros()]);

        setAgendamentos(agendamentosData);
        setDoentes(doentesData);
        setMinistros(ministrosData);
      } catch (error) {
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados para os relatórios.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Process data for reports
  useEffect(() => {
    if (!isLoading) {
      // Create combined data for reports
      const processedRelatorios = agendamentos.map((agendamento) => {
        const doente = doentes.find((d) => d.id === agendamento.doenteId);
        const ministro = ministros.find((m) => m.id === agendamento.ministroId);

        return {
          ...agendamento,
          doente: doente || { nome: "Desconhecido", setor: "Desconhecido" },
          ministro: ministro || { nome: "Desconhecido" },
        };
      });

      // Filter if user is not admin
      let filteredRelatorios = processedRelatorios;

      if (!isAdmin && currentMinistro) {
        filteredRelatorios = processedRelatorios.filter(
          (rel) => rel.ministroId === currentMinistro.id
        );
      }

      setRelatorios(filteredRelatorios);
    }
  }, [isLoading, agendamentos, doentes, ministros, isAdmin, currentMinistro]);

  // Apply filters
  const filteredRelatorios = relatorios.filter((relatorio) => {
    // Filter by nome do doente
    if (
      nomeFiltro &&
      !relatorio.doente.nome.toLowerCase().includes(nomeFiltro.toLowerCase())
    ) {
      return false;
    }

    // Filter by setor
    if (
      setorFiltro &&
      setorFiltro !== "todos" &&
      relatorio.doente.setor !== setorFiltro
    ) {
      return false;
    }

    // Filter by data
    if (dataFiltro) {
      const agendamentoDate = new Date(relatorio.data);
      if (
        agendamentoDate.getDate() !== dataFiltro.getDate() ||
        agendamentoDate.getMonth() !== dataFiltro.getMonth() ||
        agendamentoDate.getFullYear() !== dataFiltro.getFullYear()
      ) {
        return false;
      }
    }

    // Filter by ministro
    if (
      ministroFiltro &&
      ministroFiltro !== "todos" &&
      relatorio.ministroId !== ministroFiltro
    ) {
      return false;
    }

    return true;
  });

  // Get unique setores for filter
  const setores = Array.from(
    new Set(doentes.map((doente) => doente.setor))
  ).filter(Boolean);

  // Reset filters
  const resetFilters = () => {
    setNomeFiltro("");
    setSetorFiltro("todos");
    setDataFiltro(undefined);
    setMinistroFiltro("todos");
  };

  const handleFilter = () => {
    // Esta função é chamada quando o botão de filtrar é clicado
    // Como os filtros já são aplicados em tempo real, essa função não precisa fazer nada agora
    toast({
      title: "Filtros aplicados",
      description: `${filteredRelatorios.length} agendamentos encontrados`,
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Relatórios</h1>
          <div className="flex justify-center py-20">
            <p>Carregando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Relatórios</h1>
        </div>

        <ReportsFilters
          searchTerm={nomeFiltro}
          setSearchTerm={setNomeFiltro}
          selectedDate={dataFiltro}
          setSelectedDate={setDataFiltro}
          selectedSetor={setorFiltro}
          setSelectedSetor={setSetorFiltro}
          setores={setores}
          onFilter={handleFilter}
          onReset={resetFilters}
        />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Agendamentos</CardTitle>
            <CardDescription>
              {filteredRelatorios.length} agendamentos encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredRelatorios.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Nenhum agendamento encontrado com os filtros aplicados.
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Hora</TableHead>
                        <TableHead>Doente</TableHead>
                        <TableHead>Setor</TableHead>
                        <TableHead>Ministro</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRelatorios.map((relatorio) => (
                        <TableRow key={relatorio.id}>
                          <TableCell>
                            {format(new Date(relatorio.data), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell>{relatorio.hora}</TableCell>
                          <TableCell>{relatorio.doente.nome}</TableCell>
                          <TableCell>{relatorio.doente.setor}</TableCell>
                          <TableCell>{relatorio.ministro.nome}</TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                relatorio.status === "agendado" &&
                                  "bg-blue-100 text-blue-800",
                                relatorio.status === "concluido" &&
                                  "bg-green-100 text-green-800",
                                relatorio.status === "cancelado" &&
                                  "bg-red-100 text-red-800"
                              )}
                            >
                              {relatorio.status === "agendado" && "Agendado"}
                              {relatorio.status === "concluido" && "Concluído"}
                              {relatorio.status === "cancelado" && "Cancelado"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RelatoriosPage;
