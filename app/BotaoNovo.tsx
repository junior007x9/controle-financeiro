"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { salvarTransacao } from "./actions";

export default function BotaoNovo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tipoForm, setTipoForm] = useState("income");

  async function handleAction(formData: FormData) {
    await salvarTransacao(formData);
    setIsModalOpen(false);
    setTipoForm("income");
  }

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (!value) e.target.value = "";
    else e.target.value = (Number(value) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
  };

  return (
    <>
      <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 shrink-0">
        <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Novo</span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 text-left">
          <div className="bg-zinc-50 rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-white sticky top-0 z-10">
              <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">Novo Lançamento</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-700 bg-zinc-100 p-1.5 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            
            <form action={handleAction} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Tipo</label>
                  <select name="type" value={tipoForm} onChange={(e) => setTipoForm(e.target.value)} className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm text-sm">
                    <option value="income">Entrada (+)</option>
                    <option value="expense">Despesa (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Responsável</label>
                  <select name="responsavel" className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm text-sm">
                    <option value="eu">Esposa</option><option value="marido">Marido</option><option value="ambos">Dividido</option><option value="casa">Casa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Título</label>
                <input type="text" name="title" required placeholder="Ex: Geladeira Nova" className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none shadow-sm text-sm" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Valor da Parcela (R$)</label>
                  <input type="text" name="amount" required placeholder="0,00" onChange={handleCurrencyChange} className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none shadow-sm font-bold text-sm text-indigo-600" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Dia Vencimento</label>
                  <input type="number" name="dueDateDay" min="1" max="31" placeholder="Ex: 10" className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none shadow-sm text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Categoria</label>
                  <select name="categoria" className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none bg-white shadow-sm text-sm">
                    <option value="Moradia">🏠 Moradia</option>
                    <option value="Alimentação">🍔 Alimentação</option>
                    <option value="Transporte">🚗 Transporte</option>
                    <option value="Lazer">🍿 Lazer</option>
                    <option value="Saúde">💊 Saúde</option>
                    <option value="Educação">📚 Educação</option>
                    <option value="Outros">📦 Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Recorrência</label>
                  <select name="isFixed" className="w-full border border-zinc-300 rounded-lg px-3 py-2 outline-none bg-white shadow-sm text-sm">
                    <option value="false">Compra Avulsa</option>
                    <option value="true">Conta Fixa (Todo mês)</option>
                  </select>
                </div>
              </div>

              {/* OPÇÕES EXCLUSIVAS DE CARTÃO DE CRÉDITO */}
              {tipoForm === 'expense' && (
                <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-indigo-900 mb-1">Usou qual Cartão?</label>
                    <select name="banco" className="w-full border border-indigo-200 rounded-lg px-3 py-2 outline-none bg-white shadow-sm text-sm font-medium text-indigo-800">
                      <option value="Nenhum">Não (Pix / Boleto)</option>
                      <option value="Nubank">🟪 Cartão Nubank</option>
                      <option value="Inter">🟧 Cartão Inter</option>
                      <option value="Mercado Pago">🟦 Cartão Mercado Pago</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-indigo-900 mb-1">Dividiu em quantas vezes?</label>
                    <select name="parcelas" className="w-full border border-indigo-200 rounded-lg px-3 py-2 outline-none bg-white shadow-sm text-sm">
                      <option value="1">À vista (1x)</option>
                      <option value="2">2 vezes (2x)</option>
                      <option value="3">3 vezes (3x)</option>
                      <option value="4">4 vezes (4x)</option>
                      <option value="5">5 vezes (5x)</option>
                      <option value="6">6 vezes (6x)</option>
                      <option value="10">10 vezes (10x)</option>
                      <option value="12">12 vezes (12x)</option>
                    </select>
                  </div>
                </div>
              )}

              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 shadow-md">Salvar</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}