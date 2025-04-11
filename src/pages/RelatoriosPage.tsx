
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { getAgendamentos, getDoentes, getMinistros } from '@/services/mock-data';
import { Agendamento, Doente, Ministro } from '@/types';
import { useToast } from '@/hooks/use-toast';
import ReportsFilters from '@/components/reports/ReportsFilters';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const RelatoriosPage = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [doentes, setDoentes] = useState<Doente[]>([]);
  const [ministros, setMinistros] = useState<Ministro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSetor, setSelectedSetor] = useState('todos');
  const [filteredAgendamentos, setFilteredAgendamentos] = useState<Agendamento[]>([]);
  const [uniqueSetores, setUniqueSetores] = useState<string[]>([]);

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
        setFilteredAgendamentos(agendamentosData);
        
        // Extract unique setores
        const setores = Array.from(new Set(doentesData.map(d => d.setor)));
        setUniqueSetores(setores);
      } catch (error) {
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os relatórios.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleFilter = () => {
    let filtered = [...agendamentos];
    
    // Filter by doente name
    if (searchTerm) {
      filtered = filtered.filter(a => {
        const doente = getDoentePorId(a.doenteId);
        return doente.nome.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    
    // Filter by date
    if (selectedDate) {
      filtered = filtered.filter(a => {
        const agendamentoDate = new Date(a.data);
        return isSameDay(agendamentoDate, selectedDate);
      });
    }
    
    // Filter by setor
    if (selectedSetor !== 'todos') {
      filtered = filtered.filter(a => {
        const doente = getDoentePorId(a.doenteId);
        return doente.setor === selectedSetor;
      });
    }
    
    setFilteredAgendamentos(filtered);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDate(undefined);
    setSelectedSetor('todos');
    setFilteredAgendamentos(agendamentos);
  };

  const getDoentePorId = (id: string) => {
    return doentes.find(d => d.id === id) || {
      id: '',
      nome: 'Doente não encontrado',
      endereco: '',
      setor: '',
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'agendado':
        return <Badge className="bg-blue-100 text-blue-800">Agendado</Badge>;
      case 'concluido':
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'cancelado':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Visualize e filtre todos os agendamentos de visitas.
          </p>
        </div>

        <ReportsFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedSetor={selectedSetor}
          setSelectedSetor={setSelectedSetor}
          setores={uniqueSetores}
          onFilter={handleFilter}
          onReset={handleResetFilters}
        />

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <p>Carregando...</p>
          </div>
        ) : filteredAgendamentos.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">Nenhum agendamento encontrado com os filtros selecionados.</p>
          </Card>
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
                  <TableHead>Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgendamentos.map((agendamento) => {
                  const doente = getDoentePorId(agendamento.doenteId);
                  const ministro = getMinistroPorId(agendamento.ministroId);
                  
                  return (
                    <TableRow key={agendamento.id}>
                      <TableCell>
                        {format(new Date(agendamento.data), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>{agendamento.hora}</TableCell>
                      <TableCell>{doente.nome}</TableCell>
                      <TableCell>{doente.setor}</TableCell>
                      <TableCell>{ministro.nome}</TableCell>
                      <TableCell>{getStatusBadge(agendamento.status)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {agendamento.observacoes || "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RelatoriosPage;
