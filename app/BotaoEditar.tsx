"use client";

import { useState } from "react";
import { Edit2, X } from "lucide-react";
import { editarTransacao } from "./actions";

export default function BotaoEditar({ item }: { item: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tipoForm, setTipoForm] = useState(item.type);

  async function handleAction(formData: FormData) {
    await editarTransacao(formData);
    setIsModalOpen(false);
  }

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (!value) {
      e.target.value = "";
      return;
    }
    const numberValue = Number(value) / 100;
    e.target.value = numberValue.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const valorInicial = Number(item.amount).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
    <>
      <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1 text-zinc-500 hover:text-blue-600 px-2 py-1.5 rounded-md hover:bg-blue-50 transition-colors border border-zinc-200 sm:border-none sm:bg-transparent bg-white shadow-sm sm:shadow-none" title="Editar lançamento">
        <Edit2 className="w-4 h-4" />
        <span className="text-[11px] font-bold uppercase sm:hidden">Editar</span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 text-left">
          <div className="bg-zinc-50 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-zinc-200 flex items-center justify-between bg-white">
              <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600" /> Editar Lançamento
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form action={handleAction} className="p-6 space-y-5 bg-zinc-50">
              <input type="hidden" name="id" value={item.id} />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">O que é isso?</label>
                  <select name="type" value={tipoForm} onChange={(e) => setTipoForm(e.target.value)} className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-zinc-900 shadow-sm font-medium">
                    <option value="income">Entrada (+)</option>
                    <option value="expense">Despesa (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">De quem é?</label>
                  <select name="responsavel" defaultValue={item.responsavel} className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-zinc-900 shadow-sm">
                    <option value="eu">Esposa (Meu)</option>
                    <option value="marido">Marido</option>
                    <option value="ambos">Nós Dois (Dividido)</option>
                    <option value="casa">Despesas da Casa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                  {tipoForm === 'income' ? 'Título / Origem' : 'Qual é a despesa?'}
                </label>
                <input type="text" name="title" defaultValue={item.title} required className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm bg-white text-zinc-900" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Valor (R$)</label>
                  <input type="text" name="amount" defaultValue={valorInicial} onChange={handleCurrencyChange} required className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm bg-white text-zinc-900 font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Dia (Vencimento)</label>
                  <input type="number" name="dueDateDay" defaultValue={item.dueDateDay || ""} min="1" max="31" className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm bg-white text-zinc-900" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                  {tipoForm === 'income' ? 'Frequência da Entrada' : 'Tipo de Despesa'}
                </label>
                <select name="isFixed" defaultValue={item.isFixed ? "true" : "false"} className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-zinc-900 shadow-sm">
                  {tipoForm === 'income' ? (
                    <>
                      <option value="true">Renda Fixa Mensal</option>
                      <option value="false">Serviço Por Fora / Avulso</option>
                    </>
                  ) : (
                    <>
                      <option value="true">Despesa Fixa (Todo mês)</option>
                      <option value="false">Gasto Variável / Avulso</option>
                    </>
                  )}
                </select>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors mt-4 shadow-md hover:shadow-lg">
                Atualizar Lançamento
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}