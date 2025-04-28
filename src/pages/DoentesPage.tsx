import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { getDoentes } from '@/services/doentes';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import DoentesList from '@/components/cards/DoentesList';
import { useQuery } from '@tanstack/react-query';

const DoentesPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: doentes = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['doentes', page, pageSize],
    queryFn: () => getDoentes(page, pageSize),
    staleTime: 5000, 
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const normalizeText = (text: string) =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const normalizedSearch = normalizeText(searchTerm.trim());

  const filteredDoentes = doentes.filter((doente) => {
    const nome = normalizeText(doente.nome || "");
    const setor = normalizeText(doente.setor || "");
    return nome.includes(normalizedSearch) || setor.includes(normalizedSearch);
  });

  const handleDeleteDoente = () => {
    refetch();
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
            <Link to="/cadastrar-doente">
              <Button>
                <Plus className="h-4 w-2" /> Cadastrar
              </Button>
            </Link>
          </div>
        </div>

        {/* SELECT pageSize */}
        <div className="flex items-center gap-2 mb-4">
          <label htmlFor="pageSize" className="text-sm">
            Mostrar:
          </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1); // Sempre volta para página 1
            }}
            className="border rounded-md px-2 py-1 text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm">doentes por página</span>
        </div>

        {/* INPUT de busca */}
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
          <>
            <ScrollArea className="h-[calc(100vh-320px)]">
              <DoentesList
                doentes={filteredDoentes}
                onDeleteDoente={handleDeleteDoente}
              />
            </ScrollArea>

            {/* CONTROLE de página */}
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                variant="outline"
                size="sm"
              >
                Anterior
              </Button>

              <span className="text-sm">
                Página {page}
              </span>

              <Button
                onClick={() => setPage((p) => p + 1)}
                variant="outline"
                size="sm"
              >
                Próxima
              </Button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default DoentesPage;
