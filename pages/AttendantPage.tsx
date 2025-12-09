import React, { useState, useEffect } from 'react';
import { Ticket, TicketStatus, Sector, Mesa } from '../types';
import { MockService } from '../services/mockDb';
import { Megaphone, CheckSquare, SkipForward, Clock, User, Monitor } from 'lucide-react';

export default function AttendantPage() {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  
  const [myMesaId, setMyMesaId] = useState<string>('m1'); 
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [queue, setQueue] = useState<Ticket[]>([]);

  useEffect(() => {
    MockService.getSectors().then(setSectors);
    const loadedMesas = MockService.getMesas();
    setMesas(loadedMesas);
    
    if (!loadedMesas.find(m => m.id === myMesaId)) {
        setMyMesaId(loadedMesas[0]?.id || '');
    }

    refreshQueue();
    const interval = setInterval(refreshQueue, 3000);
    return () => clearInterval(interval);
  }, [myMesaId]);

  const getMyMesa = () => mesas.find(m => m.id === myMesaId);

  const refreshQueue = () => {
    const all = MockService.getTickets();
    const myMesa = getMyMesa();
    if (!myMesa) return;

    const active = all.find(t => 
      t.mesaNumber === myMesa.number && 
      (t.status === TicketStatus.CALLING || t.status === TicketStatus.IN_SERVICE)
    );
    setCurrentTicket(active || null);

    const waiting = all
      .filter(t => t.status === TicketStatus.GENERATED)
      .sort((a, b) => {
          const isAPref = a.priority !== 'Normal';
          const isBPref = b.priority !== 'Normal';
          if (isAPref && !isBPref) return -1;
          if (!isAPref && isBPref) return 1;
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
    
    setQueue(waiting);
  };

  const callNext = async () => {
    if (currentTicket) return alert("Finalize o atendimento atual primeiro.");
    const myMesa = getMyMesa();
    if (!myMesa) return;

    const ticket = await MockService.callNextTicket(myMesa.number);
    if (!ticket) alert("Não há senhas na fila.");
    refreshQueue();
  };

  const recall = () => {
    if (!currentTicket) return;
    currentTicket.calledAt = new Date().toISOString();
    MockService.updateTicket(currentTicket);
    refreshQueue();
  };

  const startService = () => {
    if (!currentTicket) return;
    currentTicket.status = TicketStatus.IN_SERVICE;
    MockService.updateTicket(currentTicket);
    refreshQueue();
  };

  const finishService = () => {
    if (!currentTicket) return;
    currentTicket.status = TicketStatus.FINISHED;
    currentTicket.finishedAt = new Date().toISOString();
    MockService.updateTicket(currentTicket);
    refreshQueue();
  };

  const getSectorName = (id: string) => sectors.find(s => s.id === id)?.name;

  return (
    <div className="max-w-6xl mx-auto p-6">
      
      {/* Configuration Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex justify-between items-center border border-gray-200">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Monitor size={20} className="text-[#3366CC]"/>
            <span className="font-semibold text-gray-700">Selecionar Mesa:</span>
            <select 
              value={myMesaId} 
              onChange={e => setMyMesaId(e.target.value)}
              className="border-gray-300 rounded-md text-sm p-1.5 focus:ring-[#3366CC] focus:border-[#3366CC]"
            >
              {mesas.map(m => (
                <option key={m.id} value={m.id}>
                    Mesa {m.number} - {m.attendantName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <User size={18} />
            <span className="text-sm">Atendente Atual: <strong>{getMyMesa()?.attendantName}</strong></span>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          <Clock size={16} className="inline mr-1" />
          {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Controls & Current Ticket */}
        <div className="md:col-span-2 space-y-6">
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-[#3366CC] p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">Atendimento Atual (Mesa {getMyMesa()?.number})</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${currentTicket ? 'bg-white text-[#3366CC]' : 'bg-blue-800 text-blue-300'}`}>
                {currentTicket?.status.replace('_', ' ') || 'LIVRE'}
              </span>
            </div>
            
            <div className="p-10 flex flex-col items-center justify-center min-h-[300px]">
              {currentTicket ? (
                <>
                  <div className="text-8xl font-black text-[#0A0A0A] mb-2">{currentTicket.code}</div>
                  <div className="text-xl text-gray-500 mb-2">{currentTicket.priority}</div>
                  <div className="text-lg text-[#3366CC] font-medium mb-8">{getSectorName(currentTicket.sectorId)}</div>
                  
                  <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                     <button onClick={recall} className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white py-4 rounded-lg font-bold transition shadow-md">
                       <Megaphone /> Chamar Novamente
                     </button>
                     {currentTicket.status === TicketStatus.CALLING ? (
                        <button onClick={startService} className="flex items-center justify-center gap-2 bg-[#A60708] hover:bg-[#850506] text-white py-4 rounded-lg font-bold transition shadow-md">
                           <User /> Iniciar
                        </button>
                     ) : (
                        <button onClick={finishService} className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-bold transition shadow-md">
                           <CheckSquare /> Finalizar
                        </button>
                     )}
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-gray-400 text-xl mb-6">Mesa Livre</p>
                  <button 
                    onClick={callNext}
                    className="flex items-center gap-2 bg-[#A60708] hover:bg-[#850506] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-red-200 transition-all hover:scale-105"
                  >
                    <SkipForward size={24} /> Chamar Próximo
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Queue List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
          <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-2xl flex justify-between items-center">
            <h3 className="font-bold text-gray-700">Fila de Espera</h3>
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">{queue.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {queue.length === 0 ? (
               <div className="text-center text-gray-400 mt-10">Fila vazia.</div>
            ) : (
              queue.map(t => (
                <div key={t.id} className="p-3 border rounded-lg hover:bg-gray-50 flex justify-between items-center bg-white shadow-sm">
                  <div>
                    <div className="font-bold text-[#0A0A0A]">{t.code}</div>
                    <div className="text-xs text-gray-500">{t.priority}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-[#3366CC]">{getSectorName(t.sectorId)}</div>
                    <div className="text-xs text-gray-400">
                        {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}