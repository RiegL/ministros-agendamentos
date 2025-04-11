
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { getDoentes } from '@/services/mock-data';
import { Doente } from '@/types';
import { useToast } from '@/hooks/use-toast';
import DoentesCard from '@/components/cards/DoentesCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

const DoentesPage = () => {
  const { toast } = useToast();
  const [doentes, setDoentes] = useState<Doente[]>([]);
  const [filteredDoentes, setFilteredDoentes] = useState<Doente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const fetchDoentes = async () => {
    try {
      const data = await getDoentes();
      setDoentes(data);
      setFilteredDoentes(data);
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
  
  useEffect(() => {
    fetchDoentes();
  }, [toast]);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDoentes(doentes);
    } else {
      const filtered = doentes.filter(doente => 
        doente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doente.setor.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDoentes(filtered);
    }
  }, [searchTerm, doentes]);
  
  const handleDeleteDoente = () => {
    fetchDoentes();
  };
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Doentes</h1>
          <Link to="/cadastrar-doente">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Cadastrar Doente
            </Button>
          </Link>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
              {filteredDoentes.map((doente) => (
                <DoentesCard 
                  key={doente.id} 
                  doente={doente} 
                  onDelete={handleDeleteDoente}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </Layout>
  );
};

export default DoentesPage;
