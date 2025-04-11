
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import AgendamentoCard from '@/components/cards/AgendamentoCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarPlus, Search, Filter } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAgendamentos, getDoentes, getMinistros, updateAgendamentoStatus } from '@/services/mock-data';
import { Agendamento, Doente, Ministro } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AgendamentosPage = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [doentes, setDoentes] = useState<Doente[]>([]);
  const [ministros, setMinistros] = useState<Ministro[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [ministroFilter, setMinistroFilter] = useState<string>('todos');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const ministroIdParam = searchParams.get('ministroId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agendamentosData, doentesData, ministrosData] = await Promise.all([
          getAgendamentos(),
          getDoentes(),
          getMinistros()
        ]);
        
        setAgendamentos(agendamentosData);
        setDoentes(doentesData);
        setMinistros(ministrosData);
        
        if (ministroIdParam) {
          setMinistroFilter(ministroIdParam);
        }
      } catch (error) {
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
  }, [toast, ministroIdParam]);

  const handleConcluirAgendamento = async (agendamentoId: string) => {
    try {
      const updatedAgendamento = await updateAgendamentoStatus(agendamentoId, 'concluido');
      setAgendamentos(agendamentos.map(a => 
        a.id === agendamentoId ? updatedAgendamento : a
      ));
      
      toast({
        title: "Agendamento concluído",
        description: "O agendamento foi marcado como concluído com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro ao concluir agendamento",
        description: "Não foi possível concluir o agendamento.",
        variant: "destructive",
      });
    }
  };

  const handleCancelarAgendamento = async (agendamentoId: string) => {
    try {
      const updatedAgendamento = await updateAgendamentoStatus(agendamentoId, 'cancelado');
      setAgendamentos(agendamentos.map(a => 
        a.id === agendamentoId ? updatedAgendamento : a
      ));
      
      toast({
        title: "Agendamento cancelado",
        description: "O agendamento foi cancelado com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro ao cancelar agendamento",
        description: "Não foi possível cancelar o agendamento.",
        variant: "destructive",
      });
    }
  };

  const getDoentePorId = (id: string) => {
    return doentes.find(d => d.id === id) || {
      id: '',
      nome: 'Doente não encontrado',
      endereco: '',
      telefone: '',
      createdAt: new Date(),
      cadastradoPor: '',
    };
  };

  const getMinistroPorId = (id: string) => {
    return ministros.find(m => m.id === id) || {
      id: '',
      nome: 'Ministro não encontrado',
      email: '',
      telefone: '',
      role: 'user' as 'admin' | 'user',
      senha: '',
      createdAt: new Date(),
    };
  };

  // Filtragem dos agendamentos
  const filteredAgendamentos = agendamentos.filter(agendamento => {
    const doente = getDoentePorId(agendamento.doenteId);
    const ministro = getMinistroPorId(agendamento.ministroId);
    
    const matchesSearch = 
      doente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ministro.nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'todos' || 
      agendamento.status === statusFilter;
    
    const matchesMinistro = 
      ministroFilter === 'todos' || 
      agendamento.ministroId === ministroFilter;
    
    return matchesSearch && matchesStatus && matchesMinistro;
  });

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
            <p className="text-muted-foreground">
              Gerencie todos os agendamentos de visitas a doentes.
            </p>
          </div>
          <Button asChild>
            <Link to="/novo-agendamento">
              <CalendarPlus className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Link>
          </Button>
        </div>

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
            
            <div className="flex-1">
              <Select value={ministroFilter} onValueChange={setMinistroFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por ministro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os ministros</SelectItem>
                  {ministros.map(ministro => (
                    <SelectItem key={ministro.id} value={ministro.id}>
                      {ministro.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Tabs defaultValue="todos" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-4">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="proximos">Próximos</TabsTrigger>
            <TabsTrigger value="passados">Passados</TabsTrigger>
          </TabsList>
          
          <TabsContent value="todos">
            {renderAgendamentosList(filteredAgendamentos)}
          </TabsContent>
          
          <TabsContent value="proximos">
            {renderAgendamentosList(
              filteredAgendamentos.filter(a => new Date(a.data) >= new Date())
            )}
          </TabsContent>
          
          <TabsContent value="passados">
            {renderAgendamentosList(
              filteredAgendamentos.filter(a => new Date(a.data) < new Date())
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );

  function renderAgendamentosList(agendamentosList: Agendamento[]) {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <p>Carregando...</p>
        </div>
      );
    }
    
    if (agendamentosList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-4">Nenhum agendamento encontrado.</p>
          <Button asChild>
            <Link to="/novo-agendamento">
              <CalendarPlus className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Link>
          </Button>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agendamentosList.map((agendamento) => (
          <AgendamentoCard
            key={agendamento.id}
            agendamento={agendamento}
            doente={getDoentePorId(agendamento.doenteId)}
            ministro={getMinistroPorId(agendamento.ministroId)}
            onConcluir={handleConcluirAgendamento}
            onCancelar={handleCancelarAgendamento}
          />
        ))}
      </div>
    );
  }
};

export default AgendamentosPage;
