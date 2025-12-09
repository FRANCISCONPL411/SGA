import { Ticket, TicketStatus, PriorityType, Sector, Mesa } from '../types';

// Initial Data - Specific Services
const SECTORS: Sector[] = [
  { id: '1', name: 'Matrícula', codePrefix: 'M' },
  { id: '2', name: 'Renovação de Matrícula', codePrefix: 'R' },
];

// Fixed 4 Mesas
const DEFAULT_MESAS: Mesa[] = [
  { id: 'm1', number: 1, attendantName: 'Atendente 1' },
  { id: 'm2', number: 2, attendantName: 'Atendente 2' },
  { id: 'm3', number: 3, attendantName: 'Atendente 3' },
  { id: 'm4', number: 4, attendantName: 'Atendente 4' },
];

// Helper to simulate DB delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// LocalStorage Keys
const KEY_TICKETS = 'sga_tickets';
const KEY_MESAS = 'sga_mesas';

export const MockService = {
  getSectors: async (): Promise<Sector[]> => {
    return SECTORS;
  },

  getMesas: (): Mesa[] => {
    const data = localStorage.getItem(KEY_MESAS);
    return data ? JSON.parse(data) : DEFAULT_MESAS;
  },

  updateMesa: (mesa: Mesa) => {
    const mesas = MockService.getMesas();
    const index = mesas.findIndex(m => m.id === mesa.id);
    if (index !== -1) {
      mesas[index] = mesa;
      localStorage.setItem(KEY_MESAS, JSON.stringify(mesas));
      window.dispatchEvent(new Event('storage'));
    }
  },

  getTickets: (): Ticket[] => {
    const data = localStorage.getItem(KEY_TICKETS);
    return data ? JSON.parse(data) : [];
  },

  saveTicket: (ticket: Ticket) => {
    const tickets = MockService.getTickets();
    tickets.push(ticket);
    localStorage.setItem(KEY_TICKETS, JSON.stringify(tickets));
    window.dispatchEvent(new Event('storage'));
  },

  updateTicket: (updatedTicket: Ticket) => {
    const tickets = MockService.getTickets();
    const index = tickets.findIndex(t => t.id === updatedTicket.id);
    if (index !== -1) {
      tickets[index] = updatedTicket;
      localStorage.setItem(KEY_TICKETS, JSON.stringify(tickets));
      window.dispatchEvent(new Event('storage'));
    }
  },

  // Reset Functionality
  resetDatabase: async () => {
    await delay(500);
    localStorage.removeItem(KEY_TICKETS);
    window.dispatchEvent(new Event('storage'));
  },

  generateTicket: async (sectorId: string, priority: PriorityType): Promise<Ticket> => {
    await delay(300);
    const tickets = MockService.getTickets();
    
    const sector = SECTORS.find(s => s.id === sectorId);
    const prefix = sector ? sector.codePrefix : 'X';
    
    const sectorCount = tickets.filter(t => t.sectorId === sectorId).length;
    
    const code = `${prefix}${priority === PriorityType.NORMAL ? '' : 'P'}-${String(sectorCount + 1).padStart(3, '0')}`;

    const newTicket: Ticket = {
      id: crypto.randomUUID(),
      code,
      priority,
      status: TicketStatus.GENERATED,
      createdAt: new Date().toISOString(),
      sectorId
    };

    MockService.saveTicket(newTicket);
    return newTicket;
  },

  callNextTicket: async (mesaNumber: number): Promise<Ticket | null> => {
    await delay(300);
    const tickets = MockService.getTickets();
    
    const waiting = tickets.filter(t => t.status === TicketStatus.GENERATED);
    
    if (waiting.length === 0) return null;

    // Priority Sort
    waiting.sort((a, b) => {
      const isAPref = a.priority !== PriorityType.NORMAL;
      const isBPref = b.priority !== PriorityType.NORMAL;
      if (isAPref && !isBPref) return -1;
      if (!isAPref && isBPref) return 1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    const nextTicket = waiting[0];
    nextTicket.status = TicketStatus.CALLING;
    nextTicket.calledAt = new Date().toISOString();
    nextTicket.mesaNumber = mesaNumber;

    MockService.updateTicket(nextTicket);
    return nextTicket;
  }
};