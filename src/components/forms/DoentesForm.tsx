
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus, Phone } from 'lucide-react';

interface DoentesFormProps {
  onSubmit: (data: {
    nome: string;
    endereco: string;
    setor: string;
    telefone: string;
    telefones: Array<{numero: string, descricao: string}>;
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
  
  // Array to store multiple phones
  const [telefones, setTelefones] = useState<Array<{numero: string, descricao: string}>>([
    { numero: '', descricao: '' }
  ]);

  const handleAddPhone = () => {
    if (telefones.length < 3) {
      setTelefones([...telefones, { numero: '', descricao: '' }]);
    } else {
      toast({
        title: "Limite atingido",
        description: "Você pode adicionar no máximo 3 telefones.",
        variant: "default"
      });
    }
  };

  const handleRemovePhone = (index: number) => {
    if (telefones.length > 1) {
      const newTelefones = [...telefones];
      newTelefones.splice(index, 1);
      setTelefones(newTelefones);
    }
  };

  const handlePhoneChange = (index: number, field: 'numero' | 'descricao', value: string) => {
    const newTelefones = [...telefones];
    newTelefones[index][field] = value;
    setTelefones(newTelefones);
    
    // Update the main telefone field with the first phone number for backward compatibility
    if (index === 0 && field === 'numero') {
      setTelefone(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome || !endereco || !setor || telefones[0].numero === '') {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    // Filter out empty phone entries
    const validTelefones = telefones.filter(tel => tel.numero.trim() !== '');
    
    onSubmit({
      nome,
      endereco,
      setor,
      telefone: telefones[0].numero, // Keep the original telefone field for backward compatibility
      telefones: validTelefones,
      observacoes
    });
    
    // Reset form
    setNome('');
    setEndereco('');
    setSetor('');
    setTelefone('');
    setTelefones([{ numero: '', descricao: '' }]);
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
            <div className="flex items-center justify-between mb-2">
              <Label>Telefones*</Label>
              {telefones.length < 3 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddPhone}
                  className="h-8 px-2"
                >
                  <Plus className="h-4 w-4 mr-1" /> Adicionar Telefone
                </Button>
              )}
            </div>
            
            {telefones.map((tel, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                <div className="col-span-5">
                  <Input
                    placeholder="(00) 00000-0000"
                    value={tel.numero}
                    onChange={(e) => handlePhoneChange(index, 'numero', e.target.value)}
                    required={index === 0}
                  />
                </div>
                <div className="col-span-6">
                  <Input
                    placeholder="Descrição (ex: Filho, Esposa)"
                    value={tel.descricao}
                    onChange={(e) => handlePhoneChange(index, 'descricao', e.target.value)}
                  />
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  {index > 0 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemovePhone(index)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                  {index === 0 && telefones.length === 1 && (
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            ))}
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
