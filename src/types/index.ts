
export interface Ministro {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  createdAt: Date;
}

export interface Doente {
  id: string;
  nome: string;
  endereco: string;
  telefone: string;
  observacoes?: string;
  createdAt: Date;
  cadastradoPor: string; // ID do ministro
}

export interface Agendamento {
  id: string;
  doenteId: string;
  ministroId: string;
  data: Date;
  hora: string;
  status: 'agendado' | 'concluido' | 'cancelado';
  observacoes?: string;
  createdAt: Date;
}
