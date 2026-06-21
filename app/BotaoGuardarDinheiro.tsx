"use client";

import { useState } from "react";
import { PiggyBank, X } from "lucide-react";
import { guardarDinheiro } from "./actions";

export default function BotaoGuardarDinheiro({ meta }: { meta: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function handleAction(formData: FormData) {
    await guardarDinheiro(formData);
    setIsModalOpen(false);
  }

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (!value) e.target.value = "";
    else e.target.value = (Number(value) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
  };

  return (
    <>
      <button onClick={() => setIsModalOpen(true)} className="w-full mt-4 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors">
        <PiggyBank className="w-4 h-4" /> Guardar Dinheiro
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 text-left">
          <div className="bg-zinc-50 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in duration-200">
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-white">
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2"><PiggyBank className="w-5 h-5 text-indigo-600"/> {meta.title}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-700 bg-zinc-100 p-1.5 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            
            <form action={handleAction} className="p-5 space-y-4">
              <input type="hidden" name="id" value={meta.id} />
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Quanto quer depositar agora? (R$)</label>
                <input type="text" name="amount" required placeholder="0,00" onChange={handleCurrencyChange} className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none shadow-sm font-bold text-sm text-indigo-600" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 shadow-md">Confirmar Depósito</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}