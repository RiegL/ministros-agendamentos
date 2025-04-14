
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import MinistrosCard from '@/components/cards/MinistrosCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getMinistros } from '@/services/supabase-data';
import { Ministro } from '@/types';
import { useToast } from '@/hooks/use-toast';

const MinistrosPage = () => {
  const [ministros, setMinistros] = useState<Ministro[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMinistros = async () => {
      try {
        const data = await getMinistros();
        setMinistros(data);
      } catch (error) {
        toast({
          title: "Erro ao carregar ministros",
          description: "Não foi possível carregar a lista de ministros.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMinistros();
  }, [toast]);

  const handleVerAgendamentos = (ministroId: string) => {
    navigate(`/agendamentos?ministroId=${ministroId}`);
  };

  const filteredMinistros = ministros.filter(ministro =>
    ministro.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ministro.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ministros</h1>
            <p className="text-muted-foreground">
              Gerencie os ministros responsáveis pelos agendamentos.
            </p>
          </div>
          <Button asChild>
            <Link to="/cadastrar-ministro">
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Ministro
            </Link>
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar ministros..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <p>Carregando...</p>
          </div>
        ) : filteredMinistros.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">Nenhum ministro encontrado.</p>
            <Button asChild>
              <Link to="/cadastrar-ministro">
                <UserPlus className="mr-2 h-4 w-4" />
                Cadastrar Ministro
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMinistros.map((ministro) => (
              <MinistrosCard
                key={ministro.id}
                ministro={ministro}
                onVerAgendamentos={handleVerAgendamentos}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MinistrosPage;
