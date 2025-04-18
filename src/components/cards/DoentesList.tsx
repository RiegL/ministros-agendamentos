
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

import { deleteDoente, hasActiveScheduling, getActiveScheduling } from '@/services/doentes';
import { getAgendamentos, addAgendamento } from '@/services/agendamentos';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Doente, Agendamento } from '@/types';
import { cn } from '@/lib/utils';
import { AlertDialogDescription } from '@radix-ui/react-alert-dialog';

interface DoentesListProps {
  doentes: Doente[];
  onDeleteDoente: () => void;
}

const DoentesList = ({ doentes, onDeleteDoente }: DoentesListProps) => {
  const { currentMinistro, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [openAgendarId, setOpenAgendarId] = useState<string | null>(null);
  const [openDeleteId, setOpenDeleteId] = useState<string | null>(null);

  const [data, setData] = useState<Date | undefined>();
  const [hora, setHora] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingDoente, setIsDeletingDoente] = useState(false);
  const [activeVisits, setActiveVisits] = useState<{ [id: string]: { hasVisit: boolean, hasSecondarySpot: boolean } }>({});

  useEffect(() => {
    const checkVisits = async () => {
      const states: { [id: string]: { hasVisit: boolean, hasSecondarySpot: boolean } } = {};
      
      // Verificar status de cada doente individualmente usando as funções globais
      for (const doente of doentes) {
        try {
          const hasVisit = await hasActiveScheduling(doente.id);
          
          if (hasVisit) {
            const activeAgendamento = await getActiveScheduling(doente.id);
            // Verifica se tem um agendamento ativo, mas sem ministro secundário
            const hasSecondarySpot = activeAgendamento && !activeAgendamento.ministroSecundarioId;
            
            // Se o usuário atual for o ministro principal, não deve poder se juntar à visita
            const canJoin = currentMinistro && activeAgendamento 
              ? activeAgendamento.ministroId !== currentMinistro.id
              : false;
            
            states[doente.id] = { 
              hasVisit, 
              hasSecondarySpot: hasSecondarySpot && canJoin 
            };
          } else {
            states[doente.id] = { hasVisit: false, hasSecondarySpot: false };
          }
        } catch (error) {
          console.error(`Erro ao verificar status do doente ${doente.id}:`, error);
          states[doente.id] = { hasVisit: false, hasSecondarySpot: false };
        }
      }
      
      setActiveVisits(states);
    };
    
    checkVisits();
  }, [doentes, currentMinistro]);

  const handleSubmit = async (e: React.FormEvent, doenteId: string) => {
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
      // Verificar novamente antes de enviar
      const activeVisit = await hasActiveScheduling(doenteId);
      const doenteState = activeVisits[doenteId];
      
      if (activeVisit && !doenteState?.hasSecondarySpot) {
        toast({
          title: "Agendamento não permitido",
          description: "Este doente já possui uma visita agendada completa.",
          variant: "destructive"
        });
        setOpenAgendarId(null);
        setIsSubmitting(false);
        return;
      }
      
      // Obter detalhes do agendamento existente se for juntar-se
      const activeAgendamento = activeVisit ? await getActiveScheduling(doenteId) : null;
      
      await addAgendamento({
        doenteId,
        ministroId: currentMinistro.id,
        data: doenteState?.hasVisit && activeAgendamento ? new Date(activeAgendamento.data) : data,
        hora: doenteState?.hasVisit && activeAgendamento ? activeAgendamento.hora : hora,
        observacoes,
        asSecondary: doenteState?.hasVisit
      });
      
      toast({
        title: doenteState?.hasVisit 
          ? "Você foi adicionado como ministro secundário" 
          : "Visita agendada",
        description: "O agendamento foi realizado com sucesso."
      });
      
      setOpenAgendarId(null);
      navigate('/agendamentos');
    } catch (error) {
      console.error("Erro ao agendar:", error);
      toast({
        title: "Erro",
        description: "Não foi possível agendar a visita.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeletingDoente(true);
    try {
      await deleteDoente(id);
      toast({ title: "Doente excluído com sucesso" });
      setOpenDeleteId(null);
      onDeleteDoente();
    } catch {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    } finally {
      setIsDeletingDoente(false);
    }
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 bg-muted font-semibold text-sm text-muted-foreground border-b">
        <div className="p-3">Nome</div>
        <div className="p-3">Setor</div>
        <div className="p-3">Telefone</div>
        <div className="p-3">Endereço</div>
        <div className="p-3 text-right">Ações</div>
      </div>

      {doentes.map((doente) => {
        const visitState = activeVisits[doente.id] || { hasVisit: false, hasSecondarySpot: false };
        const canSchedule = !visitState.hasVisit || visitState.hasSecondarySpot;
        
        return (
          <div key={doente.id} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 border-b text-sm">
            <div className="p-3">{doente.nome}</div>
            <div className="p-3">{doente.setor}</div>
            <div className="p-3 truncate max-w-[150px]">{doente.telefones?.[0]?.numero}</div>
            <div className="p-3 truncate max-w-[180px]">{doente.endereco}</div>
            <div className="p-3 flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setOpenAgendarId(doente.id)}
                disabled={!canSchedule}
              >
                {!visitState.hasVisit ? "Agendar" : 
                 visitState.hasSecondarySpot ? "Juntar-se" : "Já Agendado"}
              </Button>
              <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/editar-doente/${doente.id}`)}
                >
                   
                   Editar Doente
                </Button>
              {isAdmin && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setOpenDeleteId(doente.id)}
                >
                  Excluir
                </Button>
                
              )}

            </div>

            {/* Dialog Agendamento */}
            <Dialog open={openAgendarId === doente.id} onOpenChange={() => setOpenAgendarId(null)}>
              <DialogContent>
                <form onSubmit={(e) => handleSubmit(e, doente.id)}>
                  <DialogHeader>
                    <DialogTitle>
                      {!visitState.hasVisit ? "Agendar Visita" : "Juntar-se à Visita"}
                    </DialogTitle>
                    <DialogDescription>Para {doente.nome}</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Label>Ministro</Label>
                    <Input disabled value={currentMinistro?.nome || ''} />
                    <Label>Data</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left", !data && "text-muted-foreground")}>
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {data ? format(data, "PPP", { locale: ptBR }) : "Escolher data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={data} onSelect={setData} locale={ptBR} />
                      </PopoverContent>
                    </Popover>
                    <Label>Hora</Label>
                    <Input type="time" value={hora} onChange={(e) => setHora(e.target.value)} required />
                    <Label>Observações</Label>
                    <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Agendando..." : "Confirmar"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Dialog Excluir */}
            <AlertDialog open={openDeleteId === doente.id} onOpenChange={() => setOpenDeleteId(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Doente</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza? Esta ação não poderá ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(doente.id)}
                    disabled={isDeletingDoente}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeletingDoente ? "Excluindo..." : "Excluir"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      })}
    </div>
  );
};

export default DoentesList;
