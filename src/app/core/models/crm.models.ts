export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'vendedor';
}

export type DealStage =
  'prospecção' | 'qualificação' | 'proposta' | 'negociação' | 'ganho' | 'perdido';

export interface Customer {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'ativo' | 'lead' | 'inativo';
  createdAt: string;
}

export interface Deal {
  id: number;
  title: string;
  customerId: number;
  value: number;
  stage: DealStage;
  ownerId: number;
  expectedCloseDate: string;
}

export interface Activity {
  id: number;
  type: 'ligação' | 'email' | 'reunião' | 'tarefa';
  description: string;
  customerId: number;
  date: string;
  done: boolean;
}
