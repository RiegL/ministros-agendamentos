
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Phone, MapPin, FileText, AlertCircle, Trash2, UserPlus } from 'lucide-react';
import { Doente } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { addAgendamento, hasActiveScheduling, getAgendamentos, deleteDoente } from '@/services/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Agendamento } from '@/types';

interface DoentesCardProps {
  doente: Doente;
  onDelete?: () => void;
}

const DoentesCard = ({ doente, onDelete }: DoentesCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [data, setData] = useState<Date | undefined>(undefined);
  const [hora, setHora] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasActiveVisit, setHasActiveVisit] = useState(false);
  const [isDeletingDoente, setIsDeletingDoente] = useState(false);
  const [canJoinVisit, setCanJoinVisit] = useState(false);
  const [existingAgendamento, setExistingAgendamento] = useState<Agendamento | null>(null);
  
  const { currentMinistro, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkActiveVisit = async () => {
      try {
        // Verifica se há uma visita ativa
        const hasActive = await hasActiveScheduling(doente.id);
        setHasActiveVisit(hasActive);
        
        if (hasActive && currentMinistro) {
          // Busca todos os agendamentos
          const agendamentos = await getAgendamentos();
          
          // Filtra agendamentos ativos para este doente
          const activeAgendamento = agendamentos.find(
            a => a.doenteId === doente.id && 
                 a.status === 'agendado'
          );
          
          if (activeAgendamento) {
            setExistingAgendamento(activeAgendamento);
            
            // Verifica se o ministro atual NÃO é o ministro principal E NÃO é o secundário
            // E se não existe ministro secundário ainda
            const canJoin = currentMinistro.id !== activeAgendamento.ministroId && 
                           !activeAgendamento.ministroSecundarioId;
            
            setCanJoinVisit(canJoin);
          }
        }
      } catch (error) {
        console.error("Erro ao verificar agendamentos:", error);
      }
    };
    
    checkActiveVisit();
  }, [doente.id, currentMinistro]);
  
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
      const activeVisit = await hasActiveScheduling(doente.id);
      
      if (activeVisit && !canJoinVisit) {
        toast({
          title: "Agendamento não permitido",
          description: "Este doente já possui uma visita agendada que ainda não foi concluída.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      await addAgendamento({
        doenteId: doente.id,
        ministroId: currentMinistro.id,
        data: canJoinVisit && existingAgendamento ? new Date(existingAgendamento.data) : data,
        hora: canJoinVisit && existingAgendamento ? existingAgendamento.hora : hora,
        observacoes,
        asSecondary: canJoinVisit
      });
      
      toast({
        title: canJoinVisit ? "Você se juntou à visita" : "Agendamento realizado com sucesso",
        description: canJoinVisit ? 
          "Você foi adicionado como ministro secundário." : 
          "A visita foi agendada com sucesso."
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

  const handleJoinVisit = () => {
    // Pré-preencher com os dados do agendamento existente
    if (existingAgendamento) {
      setData(new Date(existingAgendamento.data));
      setHora(existingAgendamento.hora);
    }
    setIsDialogOpen(true);
  };

  const handleDeleteDoente = async () => {
    if (!isAdmin) return;
    
    setIsDeletingDoente(true);
    
    try {
      await deleteDoente(doente.id);
      
      toast({
        title: "Doente excluído",
        description: "O doente foi excluído com sucesso."
      });
      
      setIsDeleteDialogOpen(false);
      if (onDelete) onDelete();
    } catch (error) {
      toast({
        title: "Erro ao excluir doente",
        description: "Não foi possível excluir o doente.",
        variant: "destructive"
      });
    } finally {
      setIsDeletingDoente(false);
    }
  };

  const renderPhoneInfo = () => {
    if (!doente.telefones || doente.telefones.length === 0) {
      return (
        <div className="flex items-center">
          <Phone className="h-4 w-4 mr-2" />
          <p className="text-sm">{doente.telefone}</p>
        </div>
      );
    }
    
    return doente.telefones.map((tel, index) => (
      <div key={index} className="flex items-center">
        <Phone className="h-4 w-4 mr-2" />
        <p className="text-sm">{tel.numero} {tel.descricao && <span className="text-muted-foreground ml-1">({tel.descricao})</span>}</p>
      </div>
    ));
  };
  
  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{doente.nome}</CardTitle>
            {hasActiveVisit && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                Visita Agendada
              </Badge>
            )}
          </div>
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
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mr-2 mt-1" />
              <p className="text-sm text-muted-foreground">Setor: {doente.setor}</p>
            </div>
            
            {renderPhoneInfo()}
            
            {doente.observacoes && (
              <div className="flex items-start mt-4">
                <FileText className="h-4 w-4 mr-2 mt-1" />
                <p className="text-sm text-muted-foreground">{doente.observacoes}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {hasActiveVisit ? (
            canJoinVisit ? (
              <Button 
                className="w-full" 
                onClick={handleJoinVisit}
                variant="outline"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Juntar-se à Visita
              </Button>
            ) : (
              <Button 
                className="w-full" 
                onClick={handleAgendarVisita}
                variant="outline"
                disabled={true}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Já Possui Visita Agendada
              </Button>
            )
          ) : (
            <Button 
              className="w-full" 
              onClick={handleAgendarVisita}
              variant="outline"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Agendar Visita
            </Button>
          )}
          
          {isAdmin && (
            <Button 
              className="w-full" 
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Doente
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {canJoinVisit ? "Juntar-se à Visita" : "Agendar Visita"}
              </DialogTitle>
              <DialogDescription>
                {canJoinVisit ? `Juntar-se à visita para ${doente.nome}` : `Agendar visita para ${doente.nome}`}
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
              
              {canJoinVisit && existingAgendamento ? (
                <>
                  <div className="grid gap-2">
                    <Label>Data da Visita (Pré-agendada)</Label>
                    <Input 
                      value={format(new Date(existingAgendamento.data), "PPP", { locale: ptBR })}
                      disabled
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Hora da Visita (Pré-agendada)</Label>
                    <Input
                      value={existingAgendamento.hora}
                      disabled
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="data">Data</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="data"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !data && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
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
                </>
              )}
              
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
                {isSubmitting ? "Processando..." : canJoinVisit ? "Confirmar Participação" : "Confirmar Agendamento"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Doente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir permanentemente este doente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteDoente}
              disabled={isDeletingDoente}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingDoente ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DoentesCard;
