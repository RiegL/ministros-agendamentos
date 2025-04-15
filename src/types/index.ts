
export interface Doente {
  id: string;
  nome: string;
  endereco: string;
  setor: string;
  telefone: string;
  telefones?: TelefoneDoente[];
  observacoes?: string;
  createdAt: Date;
  cadastradoPor: string;
  latitude?: number | null;
  longitude?: number | null;
}
