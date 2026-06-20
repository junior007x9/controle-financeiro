import { Wallet, ArrowUpCircle, ArrowDownCircle, CreditCard, CalendarDays, Trash2, Users, User, TrendingUp, PieChart } from "lucide-react";
import BotaoNovo from "./BotaoNovo";
import BotaoEditar from "./BotaoEditar";
import FiltroMes from "./FiltroMes";
import { db } from "../db";
import { transactions } from "../db/schema";
import { desc } from "drizzle-orm";
import { mudarStatus, deletarTransacao } from "./actions";
import Link from "next/link";

export default async function Home({ searchParams }: any) {
  const params = await searchParams;
  const modoAtual = params?.modo || "casal"; 
  const mesAtual = params?.mes || new Date().toISOString().split("T")[0].substring(0, 7); 

  // Lógica do botão de 3 fases (Casal -> Esposa -> Marido)
  let proximoModo = "esposa";
  let textoModo = "CASAL";
  let corTexto = "text-indigo-600";
  let iconeModo = <Users className="w-4 h-4 text-indigo-600" />;

  if (modoAtual === "esposa") {
    proximoModo = "marido";
    textoModo = "ESPOSA";
    corTexto = "text-pink-600";
    iconeModo = <User className="w-4 h-4 text-pink-600" />;
  } else if (modoAtual === "marido") {
    proximoModo = "casal";
    textoModo = "MARIDO";
    corTexto = "text-blue-600";
    iconeModo = <User className="w-4 h-4 text-blue-600" />;
  }

  const meusDados = await db.select().from(transactions).orderBy(desc(transactions.id));

  // O Filtro Master: Pega o mês + Quem é o dono
  const dadosParaExibir = meusDados.filter((t) => {
    const mesCerto = t.date.startsWith(mesAtual);
    let donoCerto = true;
    if (modoAtual === "esposa") donoCerto = t.responsavel === "eu";
    if (modoAtual === "marido") donoCerto = t.responsavel === "marido";
    
    return mesCerto && donoCerto;
  });

  const entradasFixas = dadosParaExibir.filter((t) => t.type === "income" && t.isFixed).reduce((acc, t) => acc + t.amount, 0);
  const servicosPorFora = dadosParaExibir.filter((t) => t.type === "income" && !t.isFixed).reduce((acc, t) => acc + t.amount, 0);
  const despesasPendentes = dadosParaExibir.filter((t) => t.type === "expense" && t.status === "pending").reduce((acc, t) => acc + t.amount, 0);
  const totalReceitas = dadosParaExibir.filter((t) => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
  const totalDespesas = dadosParaExibir.filter((t) => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
  const saldoLiquido = totalReceitas - totalDespesas;
  
  const percentualGasto = totalReceitas > 0 ? Math.min(Math.round((totalDespesas / totalReceitas) * 100), 100) : 0;
  const formatarMoeda = (valor: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans pb-12">
      <header className="bg-zinc-900 border-b border-zinc-800 px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between shadow-md gap-4">
        <div className="flex items-center gap-3 text-white font-bold text-xl w-full sm:w-auto justify-center sm:justify-start">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="tracking-tight">Controle Financeiro</span>
        </div>
        <FiltroMes />
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-8 pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Visão Geral</h1>
            <p className="text-zinc-500 mt-1">Acompanhe e organize suas finanças com inteligência.</p>
          </div>
          
          <Link 
            href={`/?modo=${proximoModo}&mes=${mesAtual}`}
            className="bg-white text-zinc-900 px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-zinc-50 transition-colors flex items-center gap-2 shadow-sm border border-zinc-200 w-full sm:w-auto justify-center"
          >
            {iconeModo}
            <span>Visão:</span>
            <span className={corTexto}>{textoModo}</span>
          </Link>
        </div>

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
                 <p className="text-sm text-zinc-500">Balanço do cenário escolhido</p>
               </div>
               <div className="text-right">
                 <p className="text-sm font-semibold text-zinc-500 mb-1">Saldo Líquido</p>
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
               <span className="text-zinc-500">Comprometido: <strong className="text-zinc-900">{percentualGasto}%</strong></span>
               <div className="flex gap-4">
                 <span className="text-green-600">Receitas: {formatarMoeda(totalReceitas)}</span>
                 <span className="text-red-500">Despesas: {formatarMoeda(totalDespesas)}</span>
               </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
           <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4">
                <h3 className="font-semibold text-zinc-500 text-sm">Entradas Fixas</h3>
                <ArrowUpCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-zinc-900">{formatarMoeda(entradasFixas)}</p>
           </div>
           <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4">
                <h3 className="font-semibold text-zinc-500 text-sm">Serviços Por Fora</h3>
                <CreditCard className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-zinc-900">{formatarMoeda(servicosPorFora)}</p>
           </div>
           <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4">
                <h3 className="font-semibold text-zinc-500 text-sm">Despesas Pendentes</h3>
                <ArrowDownCircle className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-zinc-900">{formatarMoeda(despesasPendentes)}</p>
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
                      Nenhum lançamento neste cenário.
                    </td>
                  </tr>
                ) : (
                  dadosParaExibir.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-zinc-900 min-w-[150px]">
                        {item.title}
                        {item.isFixed && <span className="ml-2 sm:ml-3 text-[10px] bg-zinc-200 text-zinc-600 px-2.5 py-0.5 rounded-full font-bold">Fixo</span>}
                      </td>
                      <td className="px-6 py-4 text-zinc-500 min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-zinc-400" /> 
                          Dia {item.dueDateDay || "--"}
                        </div>
                      </td>
                      <td className={`px-6 py-4 font-bold min-w-[120px] ${item.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                        {item.type === 'income' ? '+ ' : '- '}
                        {formatarMoeda(item.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                          item.responsavel === 'eu' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {item.responsavel === 'eu' ? 'Esposa' : 'Marido'}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center min-w-[200px]">
                        <form action={mudarStatus}>
                          <input type="hidden" name="id" value={item.id} />
                          <input type="hidden" name="statusAtual" value={item.status || "pending"} />
                          <button type="submit" className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity w-full sm:w-auto text-center ${
                            item.status === 'paid' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-white border border-zinc-300 text-zinc-700 shadow-sm'
                          }`}>
                            {item.status === 'paid' ? 'Baixa Concluída' : 'Dar Baixa'}
                          </button>
                        </form>

                        {/* Botões AGORA SEMPRE VISÍVEIS e mais fáceis de tocar no celular */}
                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                          <BotaoEditar item={item} />
                          <form action={deletarTransacao}>
                            <input type="hidden" name="id" value={item.id} />
                            <button type="submit" className="flex items-center gap-1 text-zinc-500 hover:text-red-600 px-2 py-1.5 rounded-md hover:bg-red-50 transition-colors border border-zinc-200 sm:border-none sm:bg-transparent bg-white shadow-sm sm:shadow-none" title="Deletar">
                              <Trash2 className="w-4 h-4" />
                              <span className="text-[11px] font-bold uppercase sm:hidden">Excluir</span>
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