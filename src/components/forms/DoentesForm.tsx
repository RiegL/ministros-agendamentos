
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface DoentesFormProps {
  onSubmit: (data: {
    nome: string;
    endereco: string;
    setor: string;
    telefone: string;
    observacoes: string;
  }) => void;
  isLoading?: boolean;
}

const DoentesForm = ({ onSubmit, isLoading = false }: DoentesFormProps) => {
  const { toast } = useToast();
  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [setor, setSetor] = useState('');
  const [telefone, setTelefone] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome || !endereco || !setor || !telefone) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    onSubmit({
      nome,
      endereco,
      setor,
      telefone,
      observacoes
    });
    
    // Reset form
    setNome('');
    setEndereco('');
    setSetor('');
    setTelefone('');
    setObservacoes('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastro de Doente</CardTitle>
        <CardDescription>
          Adicione um novo doente ao sistema para agendamento de visitas.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo*</Label>
            <Input
              id="nome"
              placeholder="Nome do doente"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço Completo*</Label>
            <Input
              id="endereco"
              placeholder="Rua, número, cidade"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="setor">Setor*</Label>
            <Input
              id="setor"
              placeholder="Setor do doente"
              value={setor}
              onChange={(e) => setSetor(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone*</Label>
            <Input
              id="telefone"
              placeholder="(00) 00000-0000"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Informações adicionais sobre o doente"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
        
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Cadastrando..." : "Cadastrar Doente"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default DoentesForm;
