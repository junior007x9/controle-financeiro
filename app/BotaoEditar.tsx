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
      <button onClick={() => setIsModalOpen(true)} className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Editar">
        <Edit2 className="w-4 h-4" />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 text-left">
          <div className="bg-zinc-50 rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-white sticky top-0 z-10">
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">Editar Lançamento</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-700 bg-zinc-100 p-1.5 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            
            <form action={handleAction} className="p-5 space-y-4">
              <input type="hidden" name="id" value={item.id} />
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Tipo</label>
                  <select name="type" value={tipoForm} onChange={(e) => setTipoForm(e.target.value)} className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none bg-white text-sm">
                    <option value="income">Entrada (+)</option>
                    <option value="expense">Despesa (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Responsável</label>
                  <select name="responsavel" defaultValue={item.responsavel} className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none bg-white text-sm">
                    <option value="eu">Esposa</option><option value="marido">Marido</option><option value="ambos">Dividido</option><option value="casa">Casa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Título</label>
                <input type="text" name="title" defaultValue={item.title} required className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none text-sm" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Valor (R$)</label>
                  <input type="text" name="amount" defaultValue={valorInicial} onChange={handleCurrencyChange} required className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none text-sm font-bold text-indigo-600" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Dia Vencimento</label>
                  <input type="number" name="dueDateDay" defaultValue={item.dueDateDay || ""} min="1" max="31" className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Categoria</label>
                  <select name="categoria" defaultValue={item.categoria || "Outros"} className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none bg-white shadow-sm text-sm">
                    <option value="Salário">💰 Salário</option>
                    <option value="Moradia">🏠 Moradia</option>
                    <option value="Alimentação">🍔 Alimentação</option>
                    <option value="Transporte">🚗 Transporte</option>
                    <option value="Lazer">🍿 Lazer</option>
                    <option value="Saúde">💊 Saúde</option>
                    <option value="Educação">📚 Educação</option>
                    <option value="Serviços">💼 Serviços/Renda Extra</option>
                    <option value="Outros">📦 Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Recorrência</label>
                  <select name="isFixed" defaultValue={item.isFixed ? "true" : "false"} className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none bg-white shadow-sm text-sm">
                    <option value="false">Compra Avulsa</option>
                    <option value="true">Conta Fixa (Todo mês)</option>
                  </select>
                </div>
              </div>

              {tipoForm === 'expense' && (
                <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl space-y-3 mt-2">
                  <div>
                    <label className="block text-xs font-bold text-indigo-900 mb-1">Cartão Usado</label>
                    <select name="banco" defaultValue={item.banco || "Nenhum"} className="w-full border border-indigo-200 rounded-lg px-3 py-2 outline-none bg-white text-sm font-medium text-indigo-800">
                      <option value="Nenhum">Não (Pix / Boleto)</option>
                      <option value="Nubank">🟪 Cartão Nubank</option>
                      <option value="Inter">🟧 Cartão Inter</option>
                      <option value="Mercado Pago">🟦 Cartão Mercado Pago</option>
                    </select>
                  </div>
                </div>
              )}

              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 shadow-md mt-4">Atualizar Lançamento</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}