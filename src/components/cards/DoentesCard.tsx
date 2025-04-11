
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Phone, MapPin, FileText } from 'lucide-react';
import { Doente } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { addAgendamento } from '@/services/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface DoentesCardProps {
  doente: Doente;
}

const DoentesCard = ({ doente }: DoentesCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [data, setData] = useState<Date | undefined>(undefined);
  const [hora, setHora] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { currentMinistro } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleAgendarVisita = () => {
    setIsDialogOpen(true);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentMinistro || !data || !hora) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addAgendamento({
        doenteId: doente.id,
        ministroId: currentMinistro.id,
        data,
        hora,
        observacoes
      });
      
      toast({
        title: "Agendamento realizado com sucesso",
        description: "A visita foi agendada com sucesso."
      });
      
      setIsDialogOpen(false);
      navigate('/agendamentos');
    } catch (error) {
      toast({
        title: "Erro ao realizar agendamento",
        description: "Não foi possível concluir o agendamento.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-xl">{doente.nome}</CardTitle>
          <CardDescription>
            Cadastrado em {format(new Date(doente.createdAt), "PPP", { locale: ptBR })}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="space-y-3">
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mr-2 mt-1" />
              <p className="text-sm text-muted-foreground">{doente.endereco}</p>
            </div>
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              <p className="text-sm">{doente.telefone}</p>
            </div>
            {doente.observacoes && (
              <div className="flex items-start mt-4">
                <FileText className="h-4 w-4 mr-2 mt-1" />
                <p className="text-sm text-muted-foreground">{doente.observacoes}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleAgendarVisita}
            variant="outline"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Agendar Visita
          </Button>
        </CardFooter>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Agendar Visita</DialogTitle>
              <DialogDescription>
                Agendar visita para {doente.nome}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="ministro">Ministro</Label>
                <Input 
                  id="ministro" 
                  value={currentMinistro?.nome || ''} 
                  disabled 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="data">Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !data && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {data ? format(data, "PPP", { locale: ptBR }) : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={data}
                      onSelect={setData}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="hora">Hora</Label>
                <Input
                  id="hora"
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Detalhes sobre a visita"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Agendando..." : "Confirmar Agendamento"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DoentesCard;
