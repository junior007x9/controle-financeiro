import { Wallet, ArrowUpCircle, ArrowDownCircle, CreditCard, CalendarDays, Trash2, Users, User, TrendingUp, PieChart } from "lucide-react";
import BotaoNovo from "./BotaoNovo";
import BotaoEditar from "./BotaoEditar";
import FiltroMes from "./FiltroMes"; // <--- NOVO
import { db } from "../db";
import { transactions } from "../db/schema";
import { desc } from "drizzle-orm";
import { mudarStatus, deletarTransacao } from "./actions";
import Link from "next/link";

export default async function Home({ searchParams }: any) {
  const params = await searchParams;
  const modoAtual = params?.modo || "casal"; 
  
  // Identifica o mês que estamos olhando (Padrão: Mês atual do servidor)
  const mesAtual = params?.mes || new Date().toISOString().split("T")[0].substring(0, 7); 
  const isCasal = modoAtual === "casal";

  const meusDados = await db.select().from(transactions).orderBy(desc(transactions.id));

  // FILTRO DUPLO: Pelo Responsável (Casal/Eu) E pelo Mês Escolhido
  const dadosParaExibir = meusDados.filter((t) => {
    const donoCerto = isCasal ? true : t.responsavel === "eu";
    const mesCerto = t.date.startsWith(mesAtual);
    return donoCerto && mesCerto;
  });

  const entradasFixas = dadosParaExibir
    .filter((t) => t.type === "income" && t.isFixed)
    .reduce((acc, t) => acc + t.amount, 0);

  const servicosPorFora = dadosParaExibir
    .filter((t) => t.type === "income" && !t.isFixed)
    .reduce((acc, t) => acc + t.amount, 0);

  const despesasPendentes = dadosParaExibir
    .filter((t) => t.type === "expense" && t.status === "pending")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalReceitas = dadosParaExibir
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalDespesas = dadosParaExibir
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const saldoLiquido = totalReceitas - totalDespesas;
  
  const percentualGasto = totalReceitas > 0 
    ? Math.min(Math.round((totalDespesas / totalReceitas) * 100), 100) 
    : 0;

  const formatarMoeda = (valor: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans pb-12">
      
      <header className="bg-zinc-900 border-b border-zinc-800 px-8 py-4 flex flex-col sm:flex-row items-center justify-between shadow-md gap-4">
        <div className="flex items-center gap-3 text-white font-bold text-xl w-full sm:w-auto">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="tracking-tight">Controle Financeiro</span>
        </div>
        
        {/* FILTRO DE MÊS AQUI NO TOPO */}
        <FiltroMes />

      </header>

      <main className="max-w-5xl mx-auto p-8 pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Visão Geral</h1>
            <p className="text-zinc-500 mt-1">Acompanhe e organize suas finanças com inteligência.</p>
          </div>
          
          <Link 
            href={`/?modo=${isCasal ? 'individual' : 'casal'}&mes=${mesAtual}`}
            className="bg-white text-zinc-900 px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-zinc-50 transition-colors flex items-center gap-2 shadow-sm border border-zinc-200"
          >
            {isCasal ? <Users className="w-4 h-4 text-indigo-600" /> : <User className="w-4 h-4 text-zinc-400" />}
            <span>Modo Casal:</span>
            <span className={isCasal ? "text-indigo-600" : "text-zinc-400"}>
              {isCasal ? "ATIVADO" : "DESATIVADO"}
            </span>
          </Link>
        </div>

        {/* BARRA DE SAÚDE FINANCEIRA */}
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <PieChart className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="flex items-end justify-between mb-4">
               <div>
                 <h3 className="font-bold text-zinc-900 text-lg flex items-center gap-2">
                   <TrendingUp className="w-5 h-5 text-zinc-400" />
                   Resumo do Mês
                 </h3>
                 <p className="text-sm text-zinc-500">Balanço entre suas receitas e despesas lançadas</p>
               </div>
               <div className="text-right">
                 <p className="text-sm font-semibold text-zinc-500 mb-1">Saldo Líquido Livre</p>
                 <span className={`text-3xl font-black tracking-tight ${saldoLiquido >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatarMoeda(saldoLiquido)}
                 </span>
               </div>
            </div>
            
            <div className="w-full bg-zinc-100 rounded-full h-4 mb-3 overflow-hidden flex border border-zinc-200/50 shadow-inner">
              <div 
                className={`h-4 rounded-full transition-all duration-1000 ease-out ${percentualGasto > 85 ? 'bg-red-500' : percentualGasto > 60 ? 'bg-yellow-400' : 'bg-green-500'}`} 
                style={{ width: `${percentualGasto}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-sm font-medium">
               <span className="text-zinc-500">
                 Comprometido: <strong className="text-zinc-900">{percentualGasto}%</strong>
               </span>
               <div className="flex gap-4">
                 <span className="text-green-600">Receitas: {formatarMoeda(totalReceitas)}</span>
                 <span className="text-red-500">Despesas: {formatarMoeda(totalDespesas)}</span>
               </div>
            </div>
          </div>
        </div>

        {/* CARDS MENORES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
           <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
              <div className="flex items-center justify-between pb-4">
                <h3 className="font-semibold text-zinc-500 text-sm">Entradas Fixas</h3>
                <ArrowUpCircle className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900">{formatarMoeda(entradasFixas)}</p>
              </div>
           </div>

           <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
              <div className="flex items-center justify-between pb-4">
                <h3 className="font-semibold text-zinc-500 text-sm">Serviços Por Fora</h3>
                <CreditCard className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900">{formatarMoeda(servicosPorFora)}</p>
              </div>
           </div>

           <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 group">
              <div className="flex items-center justify-between pb-4">
                <h3 className="font-semibold text-zinc-500 text-sm">Despesas Pendentes</h3>
                <ArrowDownCircle className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900">{formatarMoeda(despesasPendentes)}</p>
              </div>
           </div>
        </div>

        {/* TABELA */}
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
                  <th className="px-6 py-4 font-medium">Lançamento</th>
                  <th className="px-6 py-4 font-medium">Vencimento</th>
                  <th className="px-6 py-4 font-medium">Valor</th>
                  <th className="px-6 py-4 font-medium">Dono</th>
                  <th className="px-6 py-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {dadosParaExibir.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 font-medium">
                      Nenhum lançamento neste mês. Que tal adicionar um?
                    </td>
                  </tr>
                ) : (
                  dadosParaExibir.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50 transition-colors group">
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
                      <td className={`px-6 py-4 font-bold ${item.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                        {item.type === 'income' ? '+ ' : '- '}
                        {formatarMoeda(item.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                          item.responsavel === 'eu' ? 'bg-indigo-50 text-indigo-700' : 'bg-purple-50 text-purple-700'
                        }`}>
                          {item.responsavel === 'eu' ? 'Meu' : 'Marido'}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-3 items-center">
                        <form action={mudarStatus}>
                          <input type="hidden" name="id" value={item.id} />
                          <input type="hidden" name="statusAtual" value={item.status || "pending"} />
                          <button type="submit" className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity ${
                            item.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-600'
                          }`}>
                            {item.status === 'paid' ? 'Baixa Concluída' : 'Dar Baixa'}
                          </button>
                        </form>

                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <BotaoEditar item={item} />
                          <form action={deletarTransacao}>
                            <input type="hidden" name="id" value={item.id} />
                            <button type="submit" className="text-zinc-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors" title="Deletar">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </form>
                        </div>
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