
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

interface MinistrosFormProps {
  onSubmit: (data: {
    nome: string;
    email: string;
    telefone: string;
    senha: string;
    role: 'admin' | 'user';
  }) => void;
  isLoading?: boolean;
}

const MinistrosForm = ({ onSubmit, isLoading = false }: MinistrosFormProps) => {
  const { toast } = useToast();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const { isAdmin } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome || !email || !telefone || !senha) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    onSubmit({
      nome,
      email,
      telefone,
      senha,
      role
    });
    
    // Reset form
    setNome('');
    setEmail('');
    setTelefone('');
    setSenha('');
    setRole('user');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastro de Ministro</CardTitle>
        <CardDescription>
          Adicione um novo ministro ao sistema para realizar agendamentos.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo*</Label>
            <Input
              id="nome"
              placeholder="Nome do ministro"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email*</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            <Label htmlFor="senha">Senha*</Label>
            <Input
              id="senha"
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          
          {isAdmin && (
            <div className="space-y-2">
              <Label htmlFor="role">Tipo de Acesso*</Label>
              <Select value={role} onValueChange={(value: 'admin' | 'user') => setRole(value)}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecione o tipo de acesso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Ministro (Usuário)</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Cadastrando..." : "Cadastrar Ministro"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default MinistrosForm;
