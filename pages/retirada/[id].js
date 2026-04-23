import { useRouter } from 'next/router';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AssinaturaMorador() {
  const router = useRouter();
  const { id } = router.query;
  const [nome, setNome] = useState('');

  const confirmarAssinatura = async () => {
    const { error } = await supabase
      .from('encomendas')
      .update({ 
        status: 'PRE_LIBERADO',
        assinatura_morador: nome,
        data_assinatura_morador: new Date().toISOString()
      })
      .eq('id', id);

    if (!error) {
      alert("Assinatura registrada! Dirija-se à portaria para retirar.");
    }
  };

  return (
    <div className="p-6 text-center">
      <h2 className="text-xl font-bold mb-4">Confirmar Retirada</h2>
      <p className="mb-4">Para retirar sua encomenda, digite seu nome completo abaixo:</p>
      <input 
        type="text" 
        className="border p-2 w-full mb-4" 
        placeholder="Seu Nome Completo"
        onChange={(e) => setNome(e.target.value)}
      />
      <button onClick={confirmarAssinatura} className="bg-green-600 text-white p-4 rounded-xl w-full">
        ASSINAR DIGITALMENTE
      </button>
    </div>
  );
}