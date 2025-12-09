export enum TicketStatus {
  GENERATED = 'GERADA',
  CALLING = 'CHAMANDO',
  IN_SERVICE = 'EM_ATENDIMENTO',
  FINISHED = 'FINALIZADA',
  CANCELED = 'CANCELADA'
}

export enum PriorityType {
  NORMAL = 'Normal',
  PREFERENTIAL = 'Preferencial',
  ELDERLY = 'Idoso',
  PCD = 'PCD',
  PREGNANT = 'Gestante'
}

export interface Ticket {
  id: string;
  code: string; // e.g., M-001, R-002
  priority: PriorityType;
  status: TicketStatus;
  createdAt: string;
  calledAt?: string;
  finishedAt?: string;
  sectorId: string;
  mesaNumber?: number; // Renamed from deskNumber/counterNumber
}

export interface Sector {
  id: string;
  name: string;
  codePrefix: string;
}

export interface Mesa { // Renamed from Desk
  id: string;
  number: number;
  attendantName: string;
}

export interface AuthUser {
  id: string;
  name: string;
  role: 'ADMIN' | 'ATTENDANT';
}

export interface DashboardStats {
  totalTickets: number;
  avgWaitTime: number; // in minutes
  ticketsByStatus: Record<string, number>;
  ticketsByPriority: Record<string, number>;
}