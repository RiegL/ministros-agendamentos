
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, File, CheckCircle, XCircle, UserPlus, MapPin } from 'lucide-react';
import { Agendamento, Doente, Ministro } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useGeolocation } from '@/hooks/useGeolocation';

interface AgendamentoCardProps {
  agendamento: Agendamento;
  doente: Doente;
  ministro: Ministro;
  ministroSecundario?: Ministro | null;
  onConcluir: (agendamentoId: string) => void;
  onCancelar: (agendamentoId: string) => void;
  onJuntar?: (agendamentoId: string) => void;
}

const AgendamentoCard = ({ 
  agendamento, 
  doente, 
  ministro, 
  ministroSecundario,
  onConcluir, 
  onCancelar,
  onJuntar
}: AgendamentoCardProps) => {
  const { currentMinistro, isAdmin } = useAuth();
  const { openMapsWithLocation } = useGeolocation();
  
  const getStatusBadge = () => {
    switch (agendamento.status) {
      case 'agendado':
        return <Badge className="bg-info">Agendado</Badge>;
      case 'concluido':
        return <Badge className="bg-success">Concluído</Badge>;
      case 'cancelado':
        return <Badge className="bg-destructive">Cancelado</Badge>;
      default:
        return null;
    }
  };

  const podeJuntar = () => {
    if (!currentMinistro || !onJuntar) return false;
    return agendamento.status === 'agendado' &&
           currentMinistro.id !== agendamento.ministroId &&
           currentMinistro.id !== agendamento.ministroSecundarioId;
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{doente.nome}</CardTitle>
            <CardDescription>
              Ministro: {ministro.nome}
              {ministroSecundario && (
                <> e {ministroSecundario.nome}</>
              )}
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-3">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <p className="text-sm">
              {format(new Date(agendamento.data), "PPP", { locale: ptBR })}
            </p>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            <p className="text-sm">{agendamento.hora}</p>
          </div>
          {agendamento.observacoes && (
            <div className="flex items-start mt-2">
              <File className="h-4 w-4 mr-2 mt-1" />
              <p className="text-sm text-muted-foreground">{agendamento.observacoes}</p>
            </div>
          )}
          {doente.latitude && doente.longitude && (
            <div className="flex items-center mt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => openMapsWithLocation(doente.latitude, doente.longitude)}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Ver Localização
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      {agendamento.status === 'agendado' && (
        <CardFooter className="grid grid-cols-1 gap-2">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => onConcluir(agendamento.id)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Concluir
            </Button>
            <Button 
              variant="outline" 
              className="w-full text-destructive hover:text-destructive" 
              onClick={() => onCancelar(agendamento.id)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
          
          {podeJuntar() && !agendamento.ministroSecundarioId && (
            <Button 
              variant="outline" 
              className="w-full mt-2" 
              onClick={() => onJuntar && onJuntar(agendamento.id)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Juntar-se
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default AgendamentoCard;
