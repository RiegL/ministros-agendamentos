import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { getDoentes } from '@/services/doentes';
import { Doente } from '@/types';
import { useToast } from '@/hooks/use-toast';
import DoentesCard from '@/components/cards/DoentesCard';
import { Button } from '@/components/ui/button';
import { Plus, Grid, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import DoentesList from '@/components/cards/DoentesList';
import { useQuery } from '@tanstack/react-query';

const DoentesPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  const {
    data: doentes = [],
    isLoading,
    refetch,
    isError,
  } = useQuery({
    queryKey: ['doentes'],
    queryFn: getDoentes,
  });

  // Filtro baseado no termo de busca
  const normalizeText = (text) =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  
  const normalizedSearch = normalizeText(searchTerm.trim());
  
  const filteredDoentes = doentes.filter((doente) => {
    const nome = normalizeText(doente.nome || "");
    const setor = normalizeText(doente.setor || "");
    return nome.includes(normalizedSearch) || setor.includes(normalizedSearch);
  });

  const handleDeleteDoente = () => {
    refetch(); // Atualiza a lista após deletar
  };

  if (isError) {
    toast({
      title: 'Erro ao carregar doentes',
      description: 'Não foi possível carregar a lista.',
      variant: 'destructive',
    });
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Doentes</h1>
          <div className="flex gap-2">
            <div className="border rounded-md flex mr-2">
              <Button
                variant={viewMode === 'card' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('card')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Link to="/cadastrar-doente">
              <Button>
                <Plus className=" h-4 w-2" /> Cadastrar
              </Button>
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <Input
            placeholder="Buscar por nome ou setor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <p>Carregando...</p>
          </div>
        ) : filteredDoentes.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground mb-2">Nenhum doente encontrado.</p>
            <Link to="/cadastrar-doente">
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" /> Cadastrar Novo Doente
              </Button>
            </Link>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-220px)]">
            {viewMode === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
                {filteredDoentes.map((doente) => (
                  <DoentesCard
                    key={doente.id}
                    doente={doente}
                    onDelete={handleDeleteDoente}
                  />
                ))}
              </div>
            ) : (
              <DoentesList
                doentes={filteredDoentes}
                onDeleteDoente={handleDeleteDoente}

              />
            )}
          </ScrollArea>
        )}
      </div>
    </Layout>
  );
};

export default DoentesPage;
