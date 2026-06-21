import { Wallet, ArrowUpCircle, ArrowDownCircle, CreditCard, CalendarDays, Trash2, Users, User, TrendingUp, PieChart, Home as HomeIcon, Copy, Target } from "lucide-react";
import BotaoNovo from "./BotaoNovo";
import BotaoEditar from "./BotaoEditar";
import FiltroMes from "./FiltroMes";
import BarraPesquisa from "./BarraPesquisa"; 
import BotaoNovaMeta from "./BotaoNovaMeta"; // <-- IMPORTANDO AS CAIXINHAS
import BotaoGuardarDinheiro from "./BotaoGuardarDinheiro";
import { db } from "../db";
import { transactions, goals } from "../db/schema"; // <-- IMPORTANDO A TABELA DE METAS
import { desc } from "drizzle-orm";
import { mudarStatus, deletarTransacao, puxarFixosDoMesPassado, deletarMeta } from "./actions";
import Link from "next/link";

export default async function Home({ searchParams }: any) {
  const params = await searchParams;
  const modoAtual = params?.modo || "casal"; 
  const mesAtual = params?.mes || new Date().toISOString().split("T")[0].substring(0, 7); 
  const busca = params?.busca?.toLowerCase() || ""; 

  let proximoModo = "esposa"; let textoModo = "CASAL"; let corTexto = "text-indigo-600"; let iconeModo = <Users className="w-4 h-4 text-indigo-600" />;
  if (modoAtual === "esposa") { proximoModo = "marido"; textoModo = "ESPOSA"; corTexto = "text-pink-600"; iconeModo = <User className="w-4 h-4 text-pink-600" />; }
  else if (modoAtual === "marido") { proximoModo = "casa"; textoModo = "MARIDO"; corTexto = "text-blue-600"; iconeModo = <User className="w-4 h-4 text-blue-600" />; }
  else if (modoAtual === "casa") { proximoModo = "casal"; textoModo = "CASA / DIVIDIDO"; corTexto = "text-amber-600"; iconeModo = <HomeIcon className="w-4 h-4 text-amber-600" />; }

  const meusDados = await db.select().from(transactions).orderBy(desc(transactions.id));
  const minhasMetas = await db.select().from(goals); // <-- BUSCA AS METAS

  const dadosParaExibir = meusDados.filter((t) => {
    const mesCerto = t.date.startsWith(mesAtual);
    let donoCerto = true;
    if (modoAtual === "esposa") donoCerto = t.responsavel === "eu";
    if (modoAtual === "marido") donoCerto = t.responsavel === "marido";
    if (modoAtual === "casa") donoCerto = t.responsavel === "casa" || t.responsavel === "ambos";
    const buscaCerta = busca === "" || t.title.toLowerCase().includes(busca);
    return mesCerto && donoCerto && buscaCerta;
  });

  const listaEntradas = dadosParaExibir.filter(t => t.type === 'income');
  const listaDespesas = dadosParaExibir.filter(t => t.type === 'expense');

  const totalReceitas = listaEntradas.reduce((acc, t) => acc + t.amount, 0);
  const totalDespesas = listaDespesas.reduce((acc, t) => acc + t.amount, 0);
  const saldoLiquido = totalReceitas - totalDespesas;
  const percentualGasto = totalReceitas > 0 ? Math.min(Math.round((totalDespesas / totalReceitas) * 100), 100) : 0;
  
  const gastosPorCategoria = listaDespesas.reduce((acc, t) => {
    const cat = t.categoria || 'Outros';
    acc[cat] = (acc[cat] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const formatarMoeda = (valor: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

  const renderTagDono = (resp: string) => {
    if (resp === 'eu') return <span className="px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-pink-50 text-pink-700 border border-pink-100 shrink-0">Esposa</span>;
    if (resp === 'marido') return <span className="px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100 shrink-0">Marido</span>;
    if (resp === 'ambos') return <span className="px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-100 shrink-0">Dividido</span>;
    if (resp === 'casa') return <span className="px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100 shrink-0">Casa</span>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans pb-12">
      <header className="bg-zinc-900 border-b border-zinc-800 px-4 sm:px-8 py-4 flex flex-col xl:flex-row items-center justify-between shadow-md gap-4">
        <div className="flex items-center gap-3 text-white font-bold text-xl w-full xl:w-auto justify-center xl:justify-start shrink-0">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="tracking-tight">Controle Financeiro</span>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full xl:w-auto justify-start xl:justify-end scrollbar-hide">
           <BarraPesquisa /> 
           <form action={puxarFixosDoMesPassado}>
             <input type="hidden" name="mesAtual" value={mesAtual} />
             <button type="submit" className="bg-amber-100 text-amber-700 px-3 py-2.5 rounded-lg text-sm font-bold hover:bg-amber-200 transition-colors flex items-center gap-2 shadow-sm border border-amber-200 shrink-0" title="Copiar fixos do mês passado">
               <Copy className="w-4 h-4" /> <span className="hidden xl:inline">Puxar Fixos</span>
             </button>
           </form>
           <BotaoNovo />
           <FiltroMes />
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-8 pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Visão Geral</h1>
            <p className="text-zinc-500 mt-1">Acompanhe e organize suas finanças com inteligência.</p>
          </div>
          <Link href={`/?modo=${proximoModo}&mes=${mesAtual}`} className="bg-white text-zinc-900 px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-zinc-50 transition-colors flex items-center gap-2 shadow-sm border border-zinc-200 w-full sm:w-auto justify-center">
            {iconeModo} <span>Filtro de Visão:</span> <span className={corTexto}>{textoModo}</span>
          </Link>
        </div>

        {/* SAÚDE FINANCEIRA */}
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5"><PieChart className="w-32 h-32" /></div>
          <div className="relative z-10">
            <div className="flex items-end justify-between mb-4">
               <div>
                 <h3 className="font-bold text-zinc-900 text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5 text-zinc-400" /> Resumo do Mês</h3>
                 <p className="text-sm text-zinc-500">Balanço do cenário: <strong className="uppercase">{textoModo}</strong></p>
               </div>
               <div className="text-right">
                 <p className="text-sm font-semibold text-zinc-500 mb-1">Saldo Livre</p>
                 <span className={`text-3xl font-black tracking-tight ${saldoLiquido >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatarMoeda(saldoLiquido)}</span>
               </div>
            </div>
            <div className="w-full bg-zinc-100 rounded-full h-4 mb-3 overflow-hidden flex border border-zinc-200/50 shadow-inner">
              <div className={`h-4 rounded-full transition-all duration-1000 ease-out ${percentualGasto > 85 ? 'bg-red-500' : percentualGasto > 60 ? 'bg-yellow-400' : 'bg-green-500'}`} style={{ width: `${percentualGasto}%` }}></div>
            </div>
            <div className="flex justify-between text-sm font-medium">
               <span className="text-zinc-500">Comprometido: <strong className="text-zinc-900">{percentualGasto}%</strong></span>
               <div className="flex gap-4"><span className="text-green-600">Receitas: {formatarMoeda(totalReceitas)}</span><span className="text-red-500">Despesas: {formatarMoeda(totalDespesas)}</span></div>
            </div>
          </div>
        </div>

        {/* --- NOVA SECÇÃO: CAIXINHAS DE METAS --- */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" /> Metas de Poupança (Caixinhas)
            </h3>
            <BotaoNovaMeta />
          </div>
          
          {minhasMetas.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center shadow-sm">
              <p className="text-zinc-500 text-sm">Nenhuma caixinha criada. Que tal criar uma meta para uma viagem ou fundo de emergência?</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {minhasMetas.map(meta => {
                 const progresso = Math.min(Math.round((meta.currentAmount / meta.targetAmount) * 100), 100);
                 return (
                   <div key={meta.id} className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative group">
                     <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-zinc-900">{meta.title}</h4>
                        <form action={deletarMeta}>
                          <input type="hidden" name="id" value={meta.id}/>
                          <button type="submit" className="text-zinc-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                        </form>
                     </div>
                     <p className="text-2xl font-black text-indigo-600">
                       {formatarMoeda(meta.currentAmount)} 
                       <span className="text-xs text-zinc-400 font-medium block sm:inline sm:ml-1">/ {formatarMoeda(meta.targetAmount)}</span>
                     </p>
                     
                     <div className="w-full bg-zinc-100 rounded-full h-2.5 mt-3 mb-1 overflow-hidden">
                       <div className="h-2.5 rounded-full bg-indigo-500 transition-all duration-1000 ease-out" style={{width: `${progresso}%`}}></div>
                     </div>
                     
                     <div className="flex justify-between text-[11px] text-zinc-500 font-bold uppercase tracking-wider mb-2 mt-2">
                       <span>{progresso}% Concluído</span>
                       <span>Faltam {formatarMoeda(meta.targetAmount - meta.currentAmount)}</span>
                     </div>
                     
                     <BotaoGuardarDinheiro meta={meta} />
                   </div>
                 )
              })}
            </div>
          )}
        </div>

        {/* BLOCOS DE CATEGORIAS */}
        {Object.keys(gastosPorCategoria).length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Para onde o dinheiro está indo?</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {Object.entries(gastosPorCategoria).sort((a, b) => b[1] - a[1]).map(([cat, val]) => (
                <div key={cat} className="min-w-[140px] bg-white border border-zinc-200 p-4 rounded-xl shadow-sm shrink-0">
                  <p className="text-xs text-zinc-500 mb-1 font-semibold">{cat}</p>
                  <p className="font-bold text-red-500 text-lg">{formatarMoeda(val)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-8">
            {/* TABELA 1: ENTRADAS */}
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-zinc-200 bg-green-50/50 flex items-center gap-2">
                <ArrowUpCircle className="w-5 h-5 text-green-600" /><h2 className="text-lg font-bold text-green-900">Entradas (Receitas do Mês)</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
                    <tr><th className="px-6 py-4 font-medium">Origem</th><th className="px-6 py-4 font-medium">Data</th><th className="px-6 py-4 font-medium">Valor</th><th className="px-6 py-4 font-medium">Dono</th><th className="px-6 py-4 font-medium">Ações</th></tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {listaEntradas.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500 font-medium">Nenhuma entrada encontrada.</td></tr>
                    ) : (
                      listaEntradas.map((item) => (
                        <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-zinc-900 min-w-[150px]">{item.title} {item.isFixed && <span className="ml-2 text-[10px] bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full font-bold">Fixo</span>}</td>
                          <td className="px-6 py-4 text-zinc-500 min-w-[120px]"><div className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-zinc-400" /> Dia {item.dueDateDay || "--"}</div></td>
                          <td className="px-6 py-4 font-bold text-green-600 min-w-[120px]">+ {formatarMoeda(item.amount)}</td>
                          <td className="px-6 py-4">{renderTagDono(item.responsavel || "eu")}</td>
                          <td className="px-6 py-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center min-w-[200px]">
                            <form action={mudarStatus}>
                              <input type="hidden" name="id" value={item.id} /><input type="hidden" name="statusAtual" value={item.status || "pending"} /><button type="submit" className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider cursor-pointer w-full sm:w-auto text-center ${item.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-white border border-zinc-300 text-zinc-700'}`}>{item.status === 'paid' ? 'Recebido' : 'Marcar Recebido'}</button>
                            </form>
                            <div className="flex items-center gap-2 mt-2 sm:mt-0">
                              <BotaoEditar item={item} />
                              <form action={deletarTransacao}><input type="hidden" name="id" value={item.id} /><button type="submit" className="flex items-center gap-1 text-zinc-500 hover:text-red-600 px-2 py-1.5 rounded-md hover:bg-red-50 transition-colors bg-white border border-zinc-200 sm:border-none sm:bg-transparent shadow-sm sm:shadow-none"><Trash2 className="w-4 h-4" /><span className="text-[11px] font-bold uppercase sm:hidden">Excluir</span></button></form>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TABELA 2: SAÍDAS */}
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden mb-12">
              <div className="p-5 border-b border-zinc-200 bg-red-50/50 flex items-center gap-2">
                <ArrowDownCircle className="w-5 h-5 text-red-600" /><h2 className="text-lg font-bold text-red-900">Despesas (Contas a Pagar)</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
                    <tr><th className="px-6 py-4 font-medium">Conta</th><th className="px-6 py-4 font-medium">Vencimento</th><th className="px-6 py-4 font-medium">Valor</th><th className="px-6 py-4 font-medium">Dono</th><th className="px-6 py-4 font-medium">Ações</th></tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {listaDespesas.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500 font-medium">Nenhuma despesa encontrada.</td></tr>
                    ) : (
                      listaDespesas.map((item) => (
                        <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-zinc-900 min-w-[150px]">{item.title} {item.isFixed && <span className="ml-2 text-[10px] bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full font-bold">Fixo</span>}</td>
                          <td className="px-6 py-4 text-zinc-500 min-w-[120px]"><div className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-zinc-400" /> Dia {item.dueDateDay || "--"}</div></td>
                          <td className="px-6 py-4 font-bold text-red-500 min-w-[120px]">- {formatarMoeda(item.amount)}</td>
                          <td className="px-6 py-4">{renderTagDono(item.responsavel || "eu")}</td>
                          <td className="px-6 py-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center min-w-[200px]">
                            <form action={mudarStatus}>
                              <input type="hidden" name="id" value={item.id} /><input type="hidden" name="statusAtual" value={item.status || "pending"} /><button type="submit" className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider cursor-pointer w-full sm:w-auto text-center ${item.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-white border border-zinc-300 text-zinc-700'}`}>{item.status === 'paid' ? 'Conta Paga' : 'Dar Baixa'}</button>
                            </form>
                            <div className="flex items-center gap-2 mt-2 sm:mt-0">
                              <BotaoEditar item={item} />
                              <form action={deletarTransacao}><input type="hidden" name="id" value={item.id} /><button type="submit" className="flex items-center gap-1 text-zinc-500 hover:text-red-600 px-2 py-1.5 rounded-md hover:bg-red-50 transition-colors bg-white border border-zinc-200 sm:border-none sm:bg-transparent shadow-sm sm:shadow-none"><Trash2 className="w-4 h-4" /><span className="text-[11px] font-bold uppercase sm:hidden">Excluir</span></button></form>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

        </div>
      </main>
    </div>
  );
}