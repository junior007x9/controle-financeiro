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

  // --- MÁSCARA DE MOEDA (Formata enquanto digita) ---
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove tudo que não for número
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

  return (
    <>
      <button onClick={() => setIsModalOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
        <Plus className="w-4 h-4" /> Nova Entrada / Saída
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 text-left">
          <div className="bg-zinc-50 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-zinc-200 flex items-center justify-between bg-white">
              <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" /> Novo Lançamento
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form action={handleAction} className="p-6 space-y-5 bg-zinc-50">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Tipo do Lançamento</label>
                  <select name="type" value={tipoForm} onChange={(e) => setTipoForm(e.target.value)} className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-zinc-900 shadow-sm font-medium">
                    <option value="income">Entrada (+)</option>
                    <option value="expense">Despesa (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">A quem pertence?</label>
                  <select name="responsavel" className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-zinc-900 shadow-sm">
                    <option value="eu">Esposa (Meu)</option>
                    <option value="marido">Marido</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                  {tipoForm === 'income' ? 'Título / Origem (Ex: Ótica Suelen, YAMAHA)' : 'Qual é a despesa? (Ex: Energia, Cartão)'}
                </label>
                <input type="text" name="title" required placeholder="Digite aqui..." className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm bg-white text-zinc-900 placeholder-zinc-400" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Valor (R$)</label>
                  {/* CAMPO DE VALOR ATUALIZADO */}
                  <input 
                    type="text" 
                    name="amount" 
                    required 
                    placeholder="0,00" 
                    onChange={handleCurrencyChange}
                    className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm bg-white text-zinc-900 placeholder-zinc-400 font-medium" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Dia (Vencimento)</label>
                  <input type="number" name="dueDateDay" min="1" max="31" placeholder="Ex: 12" className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm bg-white text-zinc-900 placeholder-zinc-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
                  {tipoForm === 'income' ? 'Frequência da Entrada' : 'Tipo de Despesa'}
                </label>
                <select name="isFixed" className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-zinc-900 shadow-sm">
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
                Salvar Lançamento
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}