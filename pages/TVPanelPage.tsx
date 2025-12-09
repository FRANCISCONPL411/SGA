import React, { useEffect, useState, useRef } from 'react';
import { Ticket, TicketStatus, Sector } from '../types';
import { MockService } from '../services/mockDb';
import { Volume2, AlertTriangle, Clock } from 'lucide-react';

export default function TVPanelPage() {
  const [lastCalled, setLastCalled] = useState<Ticket | null>(null);
  const [history, setHistory] = useState<Ticket[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  
  // Audio State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  
  // Time for ticker
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    MockService.getSectors().then(setSectors);

    // Audio setup
    const audio = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3');
    audio.load();
    audioRef.current = audio;

    // Clock Interval
    const clockInterval = setInterval(() => {
        setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(clockInterval);
    };
  }, []);

  const playAudio = async () => {
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
        setAudioError(null);
      } catch (err: any) {
        setAudioError("Erro de áudio. Verifique permissões.");
      }
    }
  };

  const fetchData = () => {
    const allTickets = MockService.getTickets();
    const calledTickets = allTickets
      .filter(t => t.status === TicketStatus.CALLING || t.status === TicketStatus.IN_SERVICE || t.status === TicketStatus.FINISHED)
      .sort((a, b) => new Date(b.calledAt!).getTime() - new Date(a.calledAt!).getTime());

    if (calledTickets.length > 0) {
      const current = calledTickets[0];
      
      setLastCalled(prev => {
        const isNewCall = !prev || prev.id !== current.id || prev.calledAt !== current.calledAt;

        if (isNewCall) {
          playAudio();
          return current;
        }
        return prev;
      });

      setHistory(calledTickets.slice(1, 6)); 
    }
  };

  // Polling
  useEffect(() => {
    fetchData(); 
    const interval = setInterval(fetchData, 2000);
    const handleStorage = () => {
        fetchData();
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const getSectorName = (id: string) => sectors.find(s => s.id === id)?.name || 'Serviço';

  if (!audioEnabled) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-white p-4">
        <button 
          onClick={() => { setAudioEnabled(true); playAudio(); }}
          className="bg-[#A60708] hover:bg-[#850506] text-white px-8 py-4 rounded-full font-bold text-xl flex items-center gap-4 transition-transform hover:scale-105 shadow-lg"
        >
          <Volume2 size={32} /> Iniciar Painel TV
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#0A0A0A] p-6 grid grid-cols-3 gap-6 overflow-hidden relative font-sans">
      
      {/* Audio Error Notification */}
      {audioError && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-[#A60708] text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 animate-bounce">
          <AlertTriangle size={20} />
          {audioError}
        </div>
      )}

      {/* Main Display Area (Left 2/3) */}
      <div className="col-span-2 flex flex-col gap-6 z-10">
        
        {/* Current Ticket Card */}
        <div className="flex-1 bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border-8 border-[#3366CC] min-h-[70vh]">
           {lastCalled ? (
             <div className="flex-1 flex flex-col items-center justify-center animate-flash">
               <span className="text-4xl text-gray-500 font-medium mb-4 uppercase tracking-widest">Senha</span>
               <div className="text-[12rem] font-black text-[#0A0A0A] leading-none tracking-tighter">
                 {lastCalled.code}
               </div>
               <div className="mt-12 bg-gray-100 px-16 py-8 rounded-3xl flex flex-col items-center shadow-inner border border-gray-200">
                 <span className="text-3xl text-[#3366CC] font-bold uppercase mb-2">Mesa</span>
                 <span className="text-9xl text-[#3366CC] font-bold leading-none">{lastCalled.mesaNumber}</span>
               </div>
               
               <div className="absolute bottom-12 text-4xl text-gray-500 font-medium">
                  {getSectorName(lastCalled.sectorId)} &bull; <span className="text-[#A60708] font-bold">{lastCalled.priority}</span>
               </div>
             </div>
           ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
                <p className="text-3xl text-gray-400 font-light">Aguardando chamada...</p>
            </div>
           )}
        </div>

        {/* Ticker Footer */}
        <div className="h-24 bg-[#3366CC] rounded-xl flex items-center px-0 shadow-lg border border-blue-800 overflow-hidden relative">
           <div className="flex-1 overflow-hidden relative h-full flex items-center">
              <p className="text-3xl font-light text-white w-full whitespace-nowrap scrolling-text absolute" style={{ animation: 'marquee 20s linear infinite' }}>
                Bem-vindo ao SGA Pro. Por favor, aguarde sua senha ser chamada. Atendimento preferencial por lei. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&bull;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {currentTime.toLocaleDateString()} - {currentTime.toLocaleTimeString()} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&bull;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Bem-vindo ao SGA Pro.
              </p>
           </div>
           
           <div className="bg-[#264d9b] h-full flex items-center px-6 z-20 shadow-[-5px_0_10px_rgba(0,0,0,0.1)]">
               <Clock className="text-white mr-3" size={24}/>
               <div className="flex flex-col text-white">
                  <span className="text-xs font-bold uppercase opacity-80">{currentTime.toLocaleDateString()}</span>
                  <span className="text-2xl font-mono font-bold leading-none">{currentTime.toLocaleTimeString()}</span>
               </div>
           </div>
        </div>
      </div>

      {/* History Sidebar (Right 1/3) */}
      <div className="col-span-1 bg-white/95 backdrop-blur-md rounded-3xl p-6 flex flex-col shadow-xl border border-gray-200 z-10 h-full">
        <h2 className="text-2xl font-bold text-[#3366CC] mb-8 border-b border-gray-200 pb-4 flex justify-between items-center">
            Últimas Chamadas
        </h2>
        
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {history.map((ticket) => (
            <div key={ticket.id} className="bg-gray-50 p-6 rounded-2xl flex justify-between items-center border-l-4 border-[#3366CC] shadow-sm">
              <div>
                <div className="text-5xl font-bold text-[#0A0A0A] mb-1">{ticket.code}</div>
                <div className="text-sm text-gray-500">{getSectorName(ticket.sectorId)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400 uppercase tracking-wider">Mesa</div>
                <div className="text-4xl font-bold text-[#A60708]">{ticket.mesaNumber}</div>
              </div>
            </div>
          ))}
          {history.length === 0 && <p className="text-gray-400 italic text-center mt-10">Histórico vazio.</p>}
        </div>
      </div>
      
      <style>{`
        @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
        }
        .scrolling-text {
            animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}