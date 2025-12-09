import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Monitor, Users, Tv, BarChart3, Menu, X } from 'lucide-react';
import KioskPage from './pages/KioskPage';
import TVPanelPage from './pages/TVPanelPage';
import AttendantPage from './pages/AttendantPage';
import AdminPage from './pages/AdminPage';
import BackendGuide from './pages/BackendGuide';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  if (location.pathname === '/tv' || location.pathname === '/kiosk') return null;

  // Updated Colors: Navbar Background #3366CC
  const navItems = [
    { name: 'Kiosk (Público)', path: '/kiosk', icon: <Monitor size={20} /> },
    { name: 'Painel TV', path: '/tv', icon: <Tv size={20} /> },
    { name: 'Atendente', path: '/attendant', icon: <Users size={20} /> },
    { name: 'Admin', path: '/admin', icon: <BarChart3 size={20} /> },
    { name: 'Backend Code', path: '/backend-code', icon: <Layout size={20} /> },
  ];

  return (
    <nav className="bg-[#3366CC] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold">S</div>
            <span className="font-bold text-xl tracking-tight">SGA Pro</span>
          </div>

          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/90'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
          
           <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white hover:text-white/80">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#2a55aa] pb-4">
           {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 text-white hover:bg-white/10"
              >
                <div className="flex items-center space-x-3">
                   {item.icon}
                   <span>{item.name}</span>
                </div>
              </Link>
            ))}
        </div>
      )}
    </nav>
  );
};

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-[#FFFFFF] flex flex-col">
        <NavBar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<HomeMenu />} />
            <Route path="/kiosk" element={<KioskPage />} />
            <Route path="/tv" element={<TVPanelPage />} />
            <Route path="/attendant" element={<AttendantPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/backend-code" element={<BackendGuide />} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
}

const HomeMenu = () => (
  <div className="max-w-4xl mx-auto py-12 px-4">
    <div className="text-center mb-12">
      <h1 className="text-4xl font-extrabold text-[#0A0A0A] mb-4">Sistema de Gestão de Atendimento</h1>
      <p className="text-lg text-gray-600">Selecione um módulo para iniciar a demonstração.</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <MenuCard 
        title="Totem de Autoatendimento" 
        desc="Emissão de senhas para clientes." 
        link="/kiosk" 
        color="bg-[#A60708]"
        icon={<Monitor className="w-8 h-8 text-white" />} 
      />
      <MenuCard 
        title="Painel de Chamada (TV)" 
        desc="Visualização de senhas e mesas." 
        link="/tv" 
        color="bg-[#3366CC]"
        icon={<Tv className="w-8 h-8 text-white" />} 
      />
      <MenuCard 
        title="Console do Atendente" 
        desc="Chamar, atender e finalizar senhas." 
        link="/attendant" 
        color="bg-[#A60708]"
        icon={<Users className="w-8 h-8 text-white" />} 
      />
      <MenuCard 
        title="Administração" 
        desc="Relatórios e configurações." 
        link="/admin" 
        color="bg-[#0A0A0A]"
        icon={<BarChart3 className="w-8 h-8 text-white" />} 
      />
    </div>
  </div>
);

const MenuCard = ({ title, desc, link, color, icon }: any) => (
  <Link to={link} className="block group">
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 h-full flex items-center space-x-6">
      <div className={`p-4 rounded-full ${color} shadow-lg group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold text-[#0A0A0A] mb-1">{title}</h3>
        <p className="text-gray-500">{desc}</p>
      </div>
    </div>
  </Link>
);