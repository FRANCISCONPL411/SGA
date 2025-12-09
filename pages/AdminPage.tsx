import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MockService } from '../services/mockDb';
import { Ticket, Mesa } from '../types';
import { Trash2, Save, MonitorPlay } from 'lucide-react';

export default function AdminPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setTickets(MockService.getTickets());
    setMesas(MockService.getMesas());
  }, [refresh]);

  const handleReset = async () => {
    if (confirm("ATENÇÃO: Tem certeza que deseja APAGAR TODAS as senhas? Esta ação não pode ser desfeita.")) {
      await MockService.resetDatabase();
      setRefresh(prev => prev + 1);
      alert("Sistema resetado com sucesso.");
    }
  };

  const handleUpdateMesa = (mesa: Mesa, newName: string) => {
    const updated = { ...mesa, attendantName: newName };
    MockService.updateMesa(updated);
    setMesas(MockService.getMesas()); 
  };

  // Stats
  const total = tickets.length;
  const finished = tickets.filter(t => t.status === 'FINALIZADA').length;
  const pending = tickets.filter(t => t.status === 'GERADA').length;
  const dataByPriority = [
    { name: 'Normal', count: tickets.filter(t => t.priority === 'Normal').length },
    { name: 'Preferencial', count: tickets.filter(t => t.priority === 'Preferencial').length },
    { name: 'Idoso', count: tickets.filter(t => t.priority === 'Idoso').length },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      
      <div className="flex justify-between items-center">
         <h1 className="text-3xl font-bold text-[#0A0A0A]">Dashboard Administrativo</h1>
         <button 
           onClick={handleReset}
           className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium"
         >
           <Trash2 size={18} /> Resetar Senhas
         </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Senhas" value={total} color="bg-[#3366CC]" />
        <StatCard title="Atendidos" value={finished} color="bg-green-600" />
        <StatCard title="Em Espera" value={pending} color="bg-orange-500" />
        <StatCard title="Tempo Médio" value={total > 0 ? "5m" : "-"} sub="Espera" color="bg-[#A60708]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Mesa Management */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-1">
           <div className="flex items-center gap-2 mb-6">
             <div className="bg-blue-100 p-2 rounded-lg text-[#3366CC]"><MonitorPlay size={20}/></div>
             <h3 className="font-bold text-[#0A0A0A] text-lg">Configuração de Mesas</h3>
           </div>
           <div className="space-y-4">
             {mesas.map(mesa => (
               <div key={mesa.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                 <div className="font-bold text-gray-500 w-20">Mesa {mesa.number}</div>
                 <div className="flex-1">
                   <input 
                     type="text" 
                     defaultValue={mesa.attendantName}
                     onBlur={(e) => handleUpdateMesa(mesa, e.target.value)}
                     className="w-full border-gray-300 rounded-md shadow-sm focus:border-[#3366CC] focus:ring-[#3366CC] sm:text-sm p-2"
                     placeholder="Nome do Atendente"
                   />
                 </div>
                 <Save size={18} className="text-gray-400" />
               </div>
             ))}
           </div>
        </div>
        
        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-1">
          <h3 className="font-bold text-[#0A0A0A] mb-4">Estatísticas por Prioridade</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataByPriority}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3366CC" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

const StatCard = ({ title, value, sub, color }: any) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center">
    <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-white font-bold text-xl shadow-lg mr-4`}>
      {String(title).charAt(0)}
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium uppercase">{title}</p>
      <div className="flex items-baseline gap-2">
        <h4 className="text-2xl font-bold text-[#0A0A0A]">{value}</h4>
        {sub && <span className="text-xs text-gray-400">{sub}</span>}
      </div>
    </div>
  </div>
);