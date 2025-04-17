import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus, Phone, MapPin, Navigation } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Doente, TelefoneDoente } from '@/types';
import { supabase } from '@/services/supabase-client';
import { useAuth } from '@/contexts/AuthContext';
import { addDoente } from '@/services/doentes';
import { useNavigate } from 'react-router-dom';

interface DoentesFormProps {
  doente?: Doente;
  onSubmit: (data: Omit<Doente, 'id' | 'createdAt'> & { id?: string }) => void;
  isLoading?: boolean;
}

const DoentesForm = ({ 
  doente, 
  onSubmit, 
  isLoading = false 
}: DoentesFormProps) => {
  const { toast } = useToast();
  const { location, error, getCurrentLocation, openMapsWithLocation } = useGeolocation();
  const { currentMinistro } = useAuth();
  const [nome, setNome] = useState(doente?.nome || '');
  const [endereco, setEndereco] = useState(doente?.endereco || '');
  const [setor, setSetor] = useState(doente?.setor || '');
  const [observacoes, setObservacoes] = useState(doente?.observacoes || '');
  const [latitude, setLatitude] = useState(doente?.latitude || null);
  const [longitude, setLongitude] = useState(doente?.longitude || null);
  const navigate = useNavigate();
  
  // Telefones agora é o único estado relacionado aos números
  const [telefones, setTelefones] = useState<TelefoneDoente[]>(doente?.telefones?.length ? [...doente.telefones] : [{ numero: '', descricao: '' }]);

  useEffect(() => {
    if (location.latitude && location.longitude) {
      setLatitude(location.latitude);
      setLongitude(location.longitude);
      toast({
        title: "Localização capturada",
        description: `Latitude: ${location.latitude}, Longitude: ${location.longitude}`
      });
    }
  }, [location, toast]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Erro de Geolocalização",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!nome || !endereco || !setor || telefones[0].numero === '') {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
  
    const validTelefones = telefones.filter(tel => tel.numero.trim() !== '');
  
    try {
      // Cria o doente
      const payload = {
        nome,
        endereco,
        setor,
        observacoes,
        latitude,
        longitude,
        cadastradoPor: currentMinistro!.id,
        telefones: validTelefones,
        ...(doente?.id ? { id: doente.id } : {})
      };
      
      onSubmit(payload);
  
      toast({
        title: "Doente criado",
        description: `Nome: ${payload.nome}`,
      });

      setNome('');
      setEndereco('');
      setSetor('');
      setObservacoes('');
      setLatitude(null);
      setLongitude(null);
      setTelefones([{ numero: '', descricao: '' }]);
  
      navigate('/doentes');
      // Aqui você pode fazer algo com o retorno, como limpar o formulário ou redirecionar
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar doente",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{doente ? 'Editar Doente' : 'Cadastro de Doente'}</CardTitle>
        <CardDescription>
          {doente ? 'Atualize as informações do doente' : 'Adicione um novo doente ao sistema para agendamento de visitas'}
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
          
          <div className="flex items-center space-x-2 mb-4">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={getCurrentLocation}
            >
              <MapPin className="mr-2 h-4 w-4" /> Capturar Localização
            </Button>
            {latitude && longitude && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => openMapsWithLocation(latitude, longitude)}
              >
                <Navigation className="mr-2 h-4 w-4" /> Ver no Mapa
              </Button>
            )}
          </div>
        </CardContent>
        
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {doente ? 'Atualizar Doente' : 'Cadastrar Doente'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default DoentesForm;
