import { Wallet, ArrowUpCircle, ArrowDownCircle, CreditCard, CalendarDays, Trash2 } from "lucide-react";
import BotaoNovo from "./BotaoNovo";
import { db } from "../db";
import { transactions } from "../db/schema";
import { desc } from "drizzle-orm";
import { mudarStatus, deletarTransacao } from "./actions";

export default async function Home() {
  const meusDados = await db.select().from(transactions).orderBy(desc(transactions.id));

  const entradasFixas = meusDados
    .filter((t) => t.type === "income" && t.isFixed)
    .reduce((acc, t) => acc + t.amount, 0);

  const servicosPorFora = meusDados
    .filter((t) => t.type === "income" && !t.isFixed)
    .reduce((acc, t) => acc + t.amount, 0);

  const despesasPendentes = meusDados
    .filter((t) => t.type === "expense" && t.status === "pending")
    .reduce((acc, t) => acc + t.amount, 0);

  const formatarMoeda = (valor: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans pb-12">
      <header className="bg-white border-b border-zinc-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 text-zinc-900 font-bold text-xl">
          <Wallet className="w-6 h-6 text-indigo-600" />
          <span>Controle Financeiro</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500 hidden sm:block">Painel de Controle</span>
          <div className="h-9 w-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold shadow-inner">
            Você
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-8 pt-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Visão Geral</h1>
            <p className="text-zinc-500 mt-1">Acompanhe e organize suas finanças mensais.</p>
          </div>
          <button className="bg-zinc-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2 shadow-md">
            <span>Modo Casal:</span>
            <span className="text-green-400 font-bold">Ativado</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
           <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
              <div className="flex items-center justify-between pb-4">
                <h3 className="font-semibold text-zinc-500 text-sm">Entradas Fixas Mensais</h3>
                <ArrowUpCircle className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <p className="text-3xl font-bold text-zinc-900">{formatarMoeda(entradasFixas)}</p>
                <p className="text-xs text-zinc-400 mt-1">Calculado do banco de dados</p>
              </div>
           </div>

           <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
              <div className="flex items-center justify-between pb-4">
                <h3 className="font-semibold text-zinc-500 text-sm">Serviços Por Fora</h3>
                <CreditCard className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <p className="text-3xl font-bold text-zinc-900">{formatarMoeda(servicosPorFora)}</p>
                <p className="text-xs text-zinc-400 mt-1">Renda extra lançada</p>
              </div>
           </div>

           <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
              <div className="flex items-center justify-between pb-4">
                <h3 className="font-semibold text-zinc-500 text-sm">Despesas Pendentes</h3>
                <ArrowDownCircle className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <p className="text-3xl font-bold text-zinc-900">{formatarMoeda(despesasPendentes)}</p>
                <p className="text-xs text-zinc-400 mt-1">Aguardando pagamento</p>
              </div>
           </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-zinc-50/50 gap-4">
            <h2 className="text-lg font-semibold text-zinc-900">Histórico de Lançamentos</h2>
            <div className="flex gap-3 w-full sm:w-auto">
              <BotaoNovo />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Cliente / Título</th>
                  <th className="px-6 py-4 font-medium">Vencimento</th>
                  <th className="px-6 py-4 font-medium">Valor</th>
                  <th className="px-6 py-4 font-medium">Tipo</th>
                  <th className="px-6 py-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                
                {meusDados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500 font-medium">
                      Nenhum lançamento encontrado. Cadastre o primeiro!
                    </td>
                  </tr>
                ) : (
                  meusDados.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-zinc-900">
                        {item.title}
                        {item.isFixed && <span className="ml-3 text-[10px] bg-zinc-200 text-zinc-600 px-2.5 py-0.5 rounded-full font-bold">Fixo</span>}
                      </td>
                      <td className="px-6 py-4 text-zinc-500">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-zinc-400" /> 
                          Dia {item.dueDateDay || "--"}
                        </div>
                      </td>
                      <td className={`px-6 py-4 font-bold ${item.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {item.type === 'income' ? '+ ' : '- '}
                        {formatarMoeda(item.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-zinc-600 capitalize">
                          {item.type === 'income' ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-3 items-center">
                        
                        {/* Botão de Dar Baixa (Pendente/Pago) */}
                        <form action={mudarStatus}>
                          <input type="hidden" name="id" value={item.id} />
                          <input type="hidden" name="statusAtual" value={item.status || "pending"} />
                          <button type="submit" className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity ${
                            item.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {item.status === 'paid' ? 'Pago' : 'Pendente'}
                          </button>
                        </form>

                        {/* Botão de Excluir */}
                        <form action={deletarTransacao}>
                          <input type="hidden" name="id" value={item.id} />
                          <button type="submit" className="text-zinc-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors" title="Deletar lançamento">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>

                      </td>
                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}