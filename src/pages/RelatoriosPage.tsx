import React, { useEffect, useRef, useState } from "react";
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
  const printRef = useRef<HTMLDivElement>(null);

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [doentes, setDoentes] = useState<Doente[]>([]);
  const [ministros, setMinistros] = useState<Ministro[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [nomeFiltro, setNomeFiltro] = useState("");
  const [setorFiltro, setSetorFiltro] = useState("todos");
  const [dataFiltro, setDataFiltro] = useState<Date | undefined>(undefined);
  const [ministroFiltro, setMinistroFiltro] = useState("todos");

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

  useEffect(() => {
    if (!isLoading) {
      const processedRelatorios = agendamentos.map((agendamento) => {
        const doente = doentes.find((d) => d.id === agendamento.doenteId);
        const ministro = ministros.find((m) => m.id === agendamento.ministroId);

        return {
          ...agendamento,
          doente: doente || { nome: "Desconhecido", setor: "Desconhecido" },
          ministro: ministro || { nome: "Desconhecido" },
        };
      });

      let filteredRelatorios = processedRelatorios;

      if (!isAdmin && currentMinistro) {
        filteredRelatorios = processedRelatorios.filter(
          (rel) => rel.ministroId === currentMinistro.id
        );
      }

      setRelatorios(filteredRelatorios);
    }
  }, [isLoading, agendamentos, doentes, ministros, isAdmin, currentMinistro]);

  const filteredRelatorios = relatorios.filter((relatorio) => {
    if (
      nomeFiltro &&
      !relatorio.doente.nome.toLowerCase().includes(nomeFiltro.toLowerCase())
    ) {
      return false;
    }

    if (
      setorFiltro &&
      setorFiltro !== "todos" &&
      relatorio.doente.setor !== setorFiltro
    ) {
      return false;
    }

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

    if (
      ministroFiltro &&
      ministroFiltro !== "todos" &&
      relatorio.ministroId !== ministroFiltro
    ) {
      return false;
    }

    return true;
  });

  const setores = Array.from(new Set(doentes.map((doente) => doente.setor))).filter(Boolean);

  const resetFilters = () => {
    setNomeFiltro("");
    setSetorFiltro("todos");
    setDataFiltro(undefined);
    setMinistroFiltro("todos");
  };

  const handleFilter = () => {
    toast({
      title: "Filtros aplicados",
      description: `${filteredRelatorios.length} agendamentos encontrados`,
    });
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContents = printRef.current.innerHTML;
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Relatório</title>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(printContents);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
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
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Imprimir
          </button>
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

        <div ref={printRef} className="mt-6">
          <Card>
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
      </div>
    </Layout>
  );
};

export default RelatoriosPage;