"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { salvarTransacao } from "./actions";

export default function BotaoNovo() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function handleAction(formData: FormData) {
    await salvarTransacao(formData);
    setIsModalOpen(false); // Fecha a janela após salvar
  }

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)} 
        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
      >
        <Plus className="w-4 h-4" /> Nova Entrada / Saída
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                Novo Lançamento
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form action={handleAction} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Título / Cliente</label>
                <input type="text" name="title" required placeholder="Ex: Ótica Suelen, YAMAHA..." className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Valor (R$)</label>
                  <input type="number" step="0.01" name="amount" required placeholder="1200.00" className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Dia do Vencimento</label>
                  <input type="number" name="dueDateDay" min="1" max="31" placeholder="Ex: 12" className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Tipo</label>
                  <select name="type" className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm">
                    <option value="income">Entrada (+)</option>
                    <option value="expense">Saída (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Frequência</label>
                  <select name="isFixed" className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm">
                    <option value="true">Fixo Mensal</option>
                    <option value="false">Serviço Por Fora</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors mt-2 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                Salvar no Banco de Dados
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}