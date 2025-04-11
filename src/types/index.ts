
export interface Ministro {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  role: 'admin' | 'user';
  senha: string; // For simplicity, we'll store plaintext password in mock data
  createdAt: Date;
}

export interface Doente {
  id: string;
  nome: string;
  endereco: string;
  setor: string; // Added setor field
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

export interface AuthContextType {
  currentMinistro: Ministro | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
}
