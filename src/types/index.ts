
export interface Doente {
  id: string;
  nome: string;
  endereco: string;
  setor: string;
  telefones?: TelefoneDoente[];
  observacoes?: string;
  createdAt: Date;
  cadastradoPor: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface TelefoneDoente {
  numero: string;
  descricao?: string;
}

export interface Ministro {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  role: 'admin' | 'user';
  senha: string;
  idAuth?: string;
  createdAt: Date;
  codigo: number;
}

export interface Agendamento {
  id: string;
  doenteId: string;
  ministroId: string;
  ministroSecundarioId?: string;
  data: Date;
  hora: string;
  status: 'agendado' | 'concluido' | 'cancelado';
  observacoes?: string;
  createdAt: Date;
}


export interface AuthContextType {
  currentMinistro: Ministro | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  codigo: number | null;
  signIn: (email: string, senha: string) => Promise<boolean>
  signInWithCode: (codigo: number) => Promise<boolean>
  signOut: () => void
  
}
