import React, { useState, useEffect } from 'react';
import { Ticket, PriorityType, Sector } from '../types';
import { MockService } from '../services/mockDb';
import { Printer, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function KioskPage() {
  const [step, setStep] = useState<'SECTOR' | 'PRIORITY' | 'SUCCESS'>('SECTOR');
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [generatedTicket, setGeneratedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    MockService.getSectors().then(setSectors);
  }, []);

  const handleSectorSelect = (sectorId: string) => {
    setSelectedSector(sectorId);
    setStep('PRIORITY');
  };

  const handleGenerate = async (priority: PriorityType) => {
    if (!selectedSector) return;
    const ticket = await MockService.generateTicket(selectedSector, priority);
    setGeneratedTicket(ticket);
    setStep('SUCCESS');
    
    // Auto reset after 5 seconds
    setTimeout(() => {
      setStep('SECTOR');
      setGeneratedTicket(null);
      setSelectedSector(null);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center p-6 relative">
      <Link to="/" className="absolute top-6 left-6 text-[#A60708] hover:text-[#0A0A0A] flex items-center gap-2 font-medium">
        <ArrowLeft size={20} /> Sair
      </Link>

      <div className="max-w-4xl w-full bg-gray-50 rounded-3xl shadow-2xl overflow-hidden min-h-[600px] flex flex-col border border-gray-100">
        {/* Header */}
        <div className="bg-[#3366CC] p-8 text-center">
          <h1 className="text-3xl font-bold text-white uppercase tracking-wider">Bem-vindo</h1>
          <p className="text-blue-100 mt-2">Toque na tela para retirar sua senha</p>
        </div>

        {/* Content */}
        <div className="flex-1 p-8 flex flex-col items-center justify-center">
          
          {step === 'SECTOR' && (
            <div className="w-full">
              <h2 className="text-2xl font-semibold text-[#0A0A0A] mb-8 text-center">Selecione o Serviço</h2>
              <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
                {sectors.map(sector => (
                  <button
                    key={sector.id}
                    onClick={() => handleSectorSelect(sector.id)}
                    className="p-8 border-2 border-gray-200 rounded-2xl bg-white hover:border-[#A60708] hover:bg-red-50 transition-all group text-left shadow-sm"
                  >
                    <span className="block text-2xl font-bold text-[#0A0A0A] group-hover:text-[#A60708]">{sector.name}</span>
                    <span className="text-gray-400 text-sm mt-1">Toque para selecionar</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'PRIORITY' && (
            <div className="w-full">
              <h2 className="text-2xl font-semibold text-[#0A0A0A] mb-8 text-center">Selecione a Categoria</h2>
              <div className="grid grid-cols-2 gap-4">
                <PriorityButton 
                  label="Normal" 
                  onClick={() => handleGenerate(PriorityType.NORMAL)} 
                  color="bg-[#A60708] hover:bg-[#850506]" 
                />
                <PriorityButton 
                  label="Preferencial" 
                  sub="(Lei 10.048/00)"
                  onClick={() => handleGenerate(PriorityType.PREFERENTIAL)} 
                  color="bg-[#A60708] hover:bg-[#850506]" 
                />
                <PriorityButton 
                  label="Idoso +80" 
                  onClick={() => handleGenerate(PriorityType.ELDERLY)} 
                  color="bg-[#A60708] hover:bg-[#850506]" 
                />
                <PriorityButton 
                  label="Gestante / PCD" 
                  onClick={() => handleGenerate(PriorityType.PCD)} 
                  color="bg-[#A60708] hover:bg-[#850506]" 
                />
              </div>
              <button 
                onClick={() => setStep('SECTOR')}
                className="mt-8 text-gray-500 hover:text-[#0A0A0A] underline w-full text-center"
              >
                Voltar
              </button>
            </div>
          )}

          {step === 'SUCCESS' && generatedTicket && (
            <div className="text-center animate-in fade-in zoom-in duration-300">
              <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl text-gray-600 mb-2">Sua senha é:</h2>
              <div className="text-8xl font-black text-[#0A0A0A] tracking-tighter mb-4">
                {generatedTicket.code}
              </div>
              <div className="inline-block bg-gray-200 px-6 py-2 rounded-full text-[#0A0A0A] font-medium mb-8">
                {generatedTicket.priority} &bull; {sectors.find(s => s.id === generatedTicket.sectorId)?.name}
              </div>
              <p className="text-gray-400 flex items-center justify-center gap-2">
                <Printer size={16} /> Imprimindo senha...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const PriorityButton = ({ label, sub, onClick, color }: any) => (
  <button
    onClick={onClick}
    className={`${color} text-white p-8 rounded-2xl shadow-lg transform transition-transform active:scale-95 flex flex-col items-center justify-center h-40`}
  >
    <span className="text-2xl font-bold">{label}</span>
    {sub && <span className="text-white/90 text-sm mt-1">{sub}</span>}
  </button>
);