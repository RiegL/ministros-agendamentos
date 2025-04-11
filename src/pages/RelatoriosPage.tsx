
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { getAgendamentos, getDoentes, getMinistros } from '@/services/mock-data';
import { Agendamento, Doente, Ministro } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Filter, Search, UserCog, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const RelatoriosPage = () => {
  const { toast } = useToast();
  const { isAdmin, currentMinistro } = useAuth();
  
  // Data states
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [doentes, setDoentes] = useState<Doente[]>([]);
  const [ministros, setMinistros] = useState<Ministro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter states
  const [nomeFiltro, setNomeFiltro] = useState('');
  const [setorFiltro, setSetorFiltro] = useState('');
  const [dataFiltro, setDataFiltro] = useState<Date | undefined>(undefined);
  const [ministroFiltro, setMinistroFiltro] = useState('');
  
  // Combined data
  const [relatorios, setRelatorios] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agendamentosData, doentesData, ministrosData] = await Promise.all([
          getAgendamentos(),
          getDoentes(),
          getMinistros(),
        ]);
        
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
      const processedRelatorios = agendamentos.map(agendamento => {
        const doente = doentes.find(d => d.id === agendamento.doenteId);
        const ministro = ministros.find(m => m.id === agendamento.ministroId);
        
        return {
          ...agendamento,
          doente: doente || { nome: 'Desconhecido', setor: 'Desconhecido' },
          ministro: ministro || { nome: 'Desconhecido' },
        };
      });
      
      // Filter if user is not admin
      let filteredRelatorios = processedRelatorios;
      
      if (!isAdmin && currentMinistro) {
        filteredRelatorios = processedRelatorios.filter(
          rel => rel.ministroId === currentMinistro.id
        );
      }
      
      setRelatorios(filteredRelatorios);
    }
  }, [isLoading, agendamentos, doentes, ministros, isAdmin, currentMinistro]);
  
  // Apply filters
  const filteredRelatorios = relatorios.filter(relatorio => {
    // Filter by nome do doente
    if (nomeFiltro && !relatorio.doente.nome.toLowerCase().includes(nomeFiltro.toLowerCase())) {
      return false;
    }
    
    // Filter by setor
    if (setorFiltro && relatorio.doente.setor !== setorFiltro) {
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
    if (ministroFiltro && relatorio.ministroId !== ministroFiltro) {
      return false;
    }
    
    return true;
  });
  
  // Get unique setores for filter
  const setores = Array.from(new Set(doentes.map(doente => doente.setor))).filter(Boolean);
  
  // Reset filters
  const resetFilters = () => {
    setNomeFiltro('');
    setSetorFiltro('');
    setDataFiltro(undefined);
    setMinistroFiltro('');
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
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Filtre os relatórios por diferentes critérios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nomeFiltro">Nome do Doente</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="nomeFiltro"
                    placeholder="Buscar por nome..."
                    value={nomeFiltro}
                    onChange={(e) => setNomeFiltro(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="setorFiltro">Setor</Label>
                <Select value={setorFiltro} onValueChange={setSetorFiltro}>
                  <SelectTrigger id="setorFiltro">
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os setores</SelectItem>
                    {setores.map((setor) => (
                      <SelectItem key={setor} value={setor}>
                        {setor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dataFiltro && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataFiltro ? format(dataFiltro, "PPP", { locale: ptBR }) : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dataFiltro}
                      onSelect={setDataFiltro}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {isAdmin && (
                <div className="space-y-2">
                  <Label htmlFor="ministroFiltro">Ministro</Label>
                  <Select value={ministroFiltro} onValueChange={setMinistroFiltro}>
                    <SelectTrigger id="ministroFiltro">
                      <SelectValue placeholder="Selecione o ministro" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os ministros</SelectItem>
                      {ministros.map((ministro) => (
                        <SelectItem key={ministro.id} value={ministro.id}>
                          {ministro.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <Button onClick={resetFilters} variant="outline" className="mt-8">
                <Filter className="mr-2 h-4 w-4" />
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
        
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
                <p className="text-muted-foreground">Nenhum agendamento encontrado com os filtros aplicados.</p>
              </div>
            ) : (
              <div className="rounded-md border">
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
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            relatorio.status === 'agendado' && "bg-blue-100 text-blue-800",
                            relatorio.status === 'concluido' && "bg-green-100 text-green-800",
                            relatorio.status === 'cancelado' && "bg-red-100 text-red-800"
                          )}>
                            {relatorio.status === 'agendado' && "Agendado"}
                            {relatorio.status === 'concluido' && "Concluído"}
                            {relatorio.status === 'cancelado' && "Cancelado"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RelatoriosPage;
