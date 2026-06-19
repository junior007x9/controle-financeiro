"use client";

import { useState } from "react";
import { Edit2, X } from "lucide-react";
import { editarTransacao } from "./actions";

export default function BotaoEditar({ item }: { item: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function handleAction(formData: FormData) {
    await editarTransacao(formData);
    setIsModalOpen(false);
  }

  return (
    <>
      <button onClick={() => setIsModalOpen(true)} className="text-zinc-400 hover:text-blue-600 p-1.5 rounded-md hover:bg-blue-50 transition-colors" title="Editar lançamento">
        <Edit2 className="w-4 h-4" />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 text-left">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600" /> Editar Lançamento
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form action={handleAction} className="p-6 space-y-5">
              <input type="hidden" name="id" value={item.id} />
              
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Título / Cliente</label>
                <input type="text" name="title" defaultValue={item.title} required className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Valor (R$)</label>
                  <input type="number" step="0.01" name="amount" defaultValue={item.amount} required className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Dia (Vencimento)</label>
                  <input type="number" name="dueDateDay" defaultValue={item.dueDateDay || ""} min="1" max="31" className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Tipo</label>
                  <select name="type" defaultValue={item.type} className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm">
                    <option value="income">Entrada (+)</option>
                    <option value="expense">Saída (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Frequência</label>
                  <select name="isFixed" defaultValue={item.isFixed ? "true" : "false"} className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm">
                    <option value="true">Fixo Mensal</option>
                    <option value="false">Serviço Por Fora</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">A quem pertence?</label>
                <select name="responsavel" defaultValue={item.responsavel} className="w-full border border-indigo-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-indigo-50/50 text-indigo-900 shadow-sm font-medium">
                  <option value="eu">Apenas Meu</option>
                  <option value="marido">Do Meu Marido</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors mt-2 shadow-md hover:shadow-lg">
                Atualizar Lançamento
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}