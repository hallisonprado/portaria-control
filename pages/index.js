import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // 1. Limpeza do CPF: Remove pontos, traços e espaços extras
    const cpfLimpo = cpf.replace(/\D/g, '').trim();

    // 2. Busca no Supabase
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('cpf', cpfLimpo)
      .single();

    // 3. Verificação de credenciais com conversão explícita para String
    // Isso evita erros caso a senha no banco seja interpretada como número
    if (user && String(user.senha_hash) === String(password).trim()) {
       if (user.primeiro_acesso) {
         alert("Primeiro acesso detectado. Defina sua nova senha.");
         // Para implementar depois: window.location.href = '/primeiro-acesso';
       } else {
         // Armazenar o usuário na sessão (opcional, mas recomendado)
         localStorage.setItem('user_portaria', JSON.stringify(user));
         window.location.href = '/dashboard';
       }
    } else {
      console.error("Erro ou usuário não encontrado:", error);
      alert("CPF ou Senha incorretos.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">Portaria Control</h1>
        
        <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
        <input 
          type="text" 
          placeholder="000.000.000-00" 
          className="w-full p-3 border rounded mb-4"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          required
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
        <input 
          type="password" 
          placeholder="Digite sua senha" 
          className="w-full p-3 border rounded mb-6"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded font-bold transition-colors"
        >
          {loading ? 'Autenticando...' : 'ENTRAR'}
        </button>
        
        <p className="mt-4 text-sm text-center text-gray-500 underline cursor-pointer">
          Esqueci minha senha
        </p>
      </form>
    </div>
  );
}
