import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Busca usuário pelo CPF
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('cpf', cpf.replace(/\D/g, ''))
      .single();

    if (user && user.senha_hash === password) {
       // Se for primeiro acesso, redireciona para troca de senha
       if (user.primeiro_acesso) {
         alert("Primeiro acesso detectado. Defina sua nova senha.");
         // Lógica de redirecionamento para /primeiro-acesso
       } else {
         window.location.href = '/dashboard';
       }
    } else {
      alert("Credenciais inválidas");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">Portaria Control</h1>
        <input 
          type="text" placeholder="CPF (Apenas números)" 
          className="w-full p-3 border rounded mb-4"
          onChange={(e) => setCpf(e.target.value)}
        />
        <input 
          type="password" placeholder="Senha" 
          className="w-full p-3 border rounded mb-6"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-blue-600 text-white p-3 rounded font-bold">
          {loading ? 'Carregando...' : 'ENTRAR'}
        </button>
        <p className="mt-4 text-sm text-center text-gray-500 underline cursor-pointer">
          Esqueci minha senha
        </p>
      </form>
    </div>
  );
}
