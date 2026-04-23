import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Package, Plus, LogOut, Search } from 'lucide-react';

export default function Dashboard() {
  const [usuario, setUsuario] = useState(null);
  const [encomendas, setEncomendas] = useState([]);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    // Recupera o usuário do localStorage que salvamos no login
    const userJson = localStorage.getItem('user_portaria');
    if (userJson) {
      setUsuario(JSON.parse(userJson));
    } else {
      window.location.href = '/'; // Se não tiver usuário, volta pro login
    }
    buscarEncomendas();
  }, []);

  async function buscarEncomendas() {
    const { data } = await supabase
      .from('encomendas')
      .select('*')
      .order('data_registro', { ascending: false });
    setEncomendas(data || []);
  }

  const sair = () => {
    localStorage.removeItem('user_portaria');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Header */}
      <div className="bg-blue-600 p-4 text-white flex justify-between items-center shadow-md">
        <div>
          <h1 className="font-bold text-lg">Portaria Control</h1>
          <p className="text-xs opacity-80">{usuario?.nome} ({usuario?.funcao})</p>
        </div>
        <button onClick={sair} className="p-2 bg-blue-700 rounded-full">
          <LogOut size={20} />
        </button>
      </div>

      {/* Barra de Busca Rápida */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por Bloco, Apto ou Nome..." 
            className="w-full p-3 pl-10 rounded-xl border-none shadow-sm"
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de Encomendas Pendentes */}
      <div className="px-4 space-y-3">
        <h2 className="font-bold text-gray-700 flex items-center gap-2">
          <Package size={18} /> Pendentes para Entrega
        </h2>
        
        {encomendas.length === 0 ? (
          <p className="text-center text-gray-500 py-10">Nenhuma encomenda pendente.</p>
        ) : (
          encomendas.map((enc) => (
            <div key={enc.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-orange-500 flex justify-between items-center">
              <div>
                <p className="font-bold text-lg">B{enc.bloco} - Apto {enc.apartamento}</p>
                <p className="text-sm text-gray-600">{enc.destinatario}</p>
                <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500">
                  {new Date(enc.data_registro).toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="text-right">
                <span className={`text-xs font-bold px-2 py-1 rounded ${enc.status === 'ASSINADA' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {enc.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Botão Flutuante de Adicionar (Otimizado para Mobile) */}
      <button 
        onClick={() => window.location.href = '/portaria/registro'}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 hover:bg-blue-700 transition-all"
      >
        <Plus size={24} />
        <span className="font-bold pr-2">NOVA ENCOMENDA</span>
      </button>
    </div>
  );
}
