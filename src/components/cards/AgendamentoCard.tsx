
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, File, CheckCircle, XCircle } from 'lucide-react';
import { Agendamento, Doente, Ministro } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

interface AgendamentoCardProps {
  agendamento: Agendamento;
  doente: Doente;
  ministro: Ministro;
  onConcluir: (agendamentoId: string) => void;
  onCancelar: (agendamentoId: string) => void;
}

const AgendamentoCard = ({ 
  agendamento, 
  doente, 
  ministro, 
  onConcluir, 
  onCancelar 
}: AgendamentoCardProps) => {
  
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
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{doente.nome}</CardTitle>
            <CardDescription>
              Ministro: {ministro.nome}
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
        </div>
      </CardContent>
      {agendamento.status === 'agendado' && (
        <CardFooter className="grid grid-cols-2 gap-2">
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
        </CardFooter>
      )}
    </Card>
  );
};

export default AgendamentoCard;
