import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface MinistrosFormProps {
  onSubmit: (data: {
    nome: string;
    email: string;
    telefone: string;
    senha: string;
    codigo: number;
    role: "admin" | "user";
  }) => void;
  isLoading?: boolean;
}

const MinistrosForm = ({ onSubmit, isLoading = false }: MinistrosFormProps) => {
  const { toast } = useToast();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [codigo, setCodigo] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const { isAdmin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !email || !telefone || !senha || !codigo) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // 1. Criar usuário no auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    if (error || !data.user) {
      toast({
        title: "Erro ao cadastrar",
        description: error?.message ?? "Erro desconhecido",
        variant: "destructive",
      });
      return;
    }

    // 2. Inserir ministro na tabela `ministros` com o id_auth
    const { error: insertError } = await supabase.from("ministros").insert({
      nome,
      email,
      telefone,
      senha,
      role,
      codigo: Number(codigo),
      id_auth: data.user.id, // esse campo precisa existir na sua tabela
    });

    if (insertError) {
      toast({
        title: "Erro ao salvar ministro",
        description: insertError.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Ministro cadastrado com sucesso",
      description: `Ministro ${nome} foi criado.`,
    });

    // Resetar formulário
    setNome("");
    setEmail("");
    setTelefone("");
    setSenha("");
    setCodigo("");
    setRole("user");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
            <div className="relative">
              <Input
                id="senha"
                type={showPassword ? "text" : "password"}
                placeholder="sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="codigo">Código de Acesso*</Label>
            <Input
              id="codigo"
              type="number"
              placeholder="ex: 2233"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
            />
          </div>

          {isAdmin && (
            <div className="space-y-2">
              <Label htmlFor="role">Tipo de Acesso*</Label>
              <Select
                value={role}
                onValueChange={(value: "admin" | "user") => setRole(value)}
              >
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
