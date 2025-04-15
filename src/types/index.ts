
export interface Ministro {
  id: string;
  id_auth: string;
  nome: string;
  email: string;
  telefone: string;
  role: 'admin' | 'user';
  senha: string; // For simplicity, we'll store plaintext password in mock data
  createdAt: Date;
}

export interface TelefoneDoente {
  numero: string;
  descricao?: string;
}

export interface Doente {
  id: string;
  nome: string;
  endereco: string;
  setor: string;
  telefone: string; // Keep for backward compatibility
  telefones?: TelefoneDoente[]; // New field for multiple phones
  observacoes?: string;
  createdAt: Date;
  cadastradoPor: string; // ID do ministro
}

export interface Agendamento {
  id: string;
  doenteId: string;
  ministroId: string;
  ministroSecundarioId?: string; // Adding support for a second minister
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
