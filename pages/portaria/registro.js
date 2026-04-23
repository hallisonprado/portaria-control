import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Camera, ArrowLeft, Send } from 'lucide-react';

export default function Registro() {
  const [usuario, setUsuario] = useState(null);
  const [form, setForm] = useState({ destinatario: '', bloco: '', apto: '', remetente: '' });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userJson = localStorage.getItem('user_portaria');
    if (userJson) setUsuario(JSON.parse(userJson));
    else window.location.href = '/';
  }, []);

  const handleCapture = (e) => {
    if (e.target.files[0]) setImageFile(e.target.files[0]);
  };

  const salvarEncomenda = async () => {
    if (!form.destinatario || !form.apto) return alert("Preencha ao menos Nome e Apto");
    setLoading(true);

    try {
      let fotoUrl = '';
      // 1. Upload da Foto (Bucket 'encomendas' deve estar como público no Supabase)
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data, error: uploadError } = await supabase.storage
          .from('encomendas')
          .upload(fileName, imageFile);
        
        if (uploadError) throw uploadError;
        fotoUrl = data.path;
      }

      // 2. Inserir no Banco
      const { data: enc, error: dbError } = await supabase.from('encomendas').insert([{
        condominio_id: usuario.condominio_id,
        destinatario: form.destinatario,
        bloco: form.bloco,
        apartamento: form.apto,
        remetente: form.remetente,
        foto_etiqueta_url: fotoUrl,
        status: 'PENDENTE',
        criado_por: usuario.id
      }]).select().single();

      if (dbError) throw dbError;

      // 3. Gerar Mensagem WhatsApp
      const linkConsulta = `${window.location.origin}/retirada/${enc.id}`;
      const texto = `Caro morador do B${form.bloco} - Apto ${form.apto}, chegou uma encomenda para ${form.destinatario}. Retire na portaria. Link: ${linkConsulta}`;
      
      window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
      window.location.href = '/dashboard';

    } catch (err) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="p-4 bg-blue-600 text-white flex items-center gap-4">
        <button onClick={() => window.location.href = '/dashboard'}><ArrowLeft /></button>
        <h1 className="font-bold">Nova Encomenda</h1>
      </div>

      <div className="p-6 space-y-4">
        {/* Input de Câmera */}
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-3xl bg-gray-50 active:bg-gray-100 transition-colors">
          <Camera size={40} className="text-gray-400 mb-2" />
          <span className="text-gray-500 font-medium">Capturar Etiqueta</span>
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCapture} />
          {imageFile && <p className="mt-2 text-xs text-blue-600 font-bold">✓ Foto selecionada</p>}
        </label>

        <input 
          placeholder="Nome do Destinatário" 
          className="w-full p-4 bg-gray-100 rounded-2xl border-none outline-blue-500"
          onChange={e => setForm({...form, destinatario: e.target.value})}
        />

        <div className="flex gap-2">
          <input 
            placeholder="Bloco" 
            className="w-1/3 p-4 bg-gray-100 rounded-2xl border-none"
            onChange={e => setForm({...form, bloco: e.target.value})}
          />
          <input 
            placeholder="Apartamento" 
            className="w-2/3 p-4 bg-gray-100 rounded-2xl border-none"
            onChange={e => setForm({...form, apto: e.target.value})}
          />
        </div>

        <input 
          placeholder="Remetente (Ex: Amazon, Mercado Livre)" 
          className="w-full p-4 bg-gray-100 rounded-2xl border-none"
          onChange={e => setForm({...form, remetente: e.target.value})}
        />

        <button 
          onClick={salvarEncomenda}
          disabled={loading}
          className="w-full bg-green-600 text-white p-5 rounded-3xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-green-200"
        >
          {loading ? 'Salvando...' : <><Send size={20}/> REGISTRAR E NOTIFICAR</>}
        </button>
      </div>
    </div>
  );
}
