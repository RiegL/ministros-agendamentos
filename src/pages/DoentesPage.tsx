
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import DoentesCard from '@/components/cards/DoentesCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getDoentes } from '@/services/mock-data';
import { Doente } from '@/types';
import { useToast } from '@/hooks/use-toast';

const DoentesPage = () => {
  const [doentes, setDoentes] = useState<Doente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDoentes = async () => {
      try {
        const data = await getDoentes();
        setDoentes(data);
      } catch (error) {
        toast({
          title: "Erro ao carregar doentes",
          description: "Não foi possível carregar a lista de doentes.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoentes();
  }, [toast]);

  const filteredDoentes = doentes.filter(doente =>
    doente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doente.endereco.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Doentes</h1>
            <p className="text-muted-foreground">
              Gerencie os doentes cadastrados no sistema.
            </p>
          </div>
          <Button asChild>
            <Link to="/cadastrar-doente">
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Doente
            </Link>
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar doentes..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <p>Carregando...</p>
          </div>
        ) : filteredDoentes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">Nenhum doente encontrado.</p>
            <Button asChild>
              <Link to="/cadastrar-doente">
                <UserPlus className="mr-2 h-4 w-4" />
                Cadastrar Doente
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoentes.map((doente) => (
              <DoentesCard
                key={doente.id}
                doente={doente}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DoentesPage;
