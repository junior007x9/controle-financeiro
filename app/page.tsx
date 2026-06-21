import { Wallet, ArrowUpCircle, ArrowDownCircle, CalendarDays, Trash2, Users, User, PieChart, Home as HomeIcon, Copy, Target, CheckCircle2, Circle } from "lucide-react";
import BotaoNovo from "./BotaoNovo";
import BotaoEditar from "./BotaoEditar";
import FiltroMes from "./FiltroMes";
import BarraPesquisa from "./BarraPesquisa"; 
import BotaoNovaMeta from "./BotaoNovaMeta"; 
import BotaoGuardarDinheiro from "./BotaoGuardarDinheiro";
import GraficoCategorias from "./GraficoCategorias"; 
import { db } from "../db";
import { transactions, goals } from "../db/schema"; 
import { desc } from "drizzle-orm";
import { mudarStatus, deletarTransacao, puxarFixosDoMesPassado, deletarMeta } from "./actions";
import Link from "next/link";

export default async function Home({ searchParams }: any) {
  const params = await searchParams;
  const modoAtual = params?.modo || "casal"; 
  const mesAtual = params?.mes || new Date().toISOString().split("T")[0].substring(0, 7); 
  const busca = params?.busca?.toLowerCase() || ""; 

  const modosMenu = [
    { id: 'casal', nome: 'Geral (Casal)', icone: Users, cor: 'text-indigo-600', bgAtivo: 'bg-indigo-600 text-white shadow-md' },
    { id: 'esposa', nome: 'Esposa', icone: User, cor: 'text-pink-600', bgAtivo: 'bg-pink-600 text-white shadow-md' },
    { id: 'marido', nome: 'Marido', icone: User, cor: 'text-blue-600', bgAtivo: 'bg-blue-600 text-white shadow-md' },
    { id: 'casa', nome: 'Despesas Casa', icone: HomeIcon, cor: 'text-amber-600', bgAtivo: 'bg-amber-500 text-white shadow-md' },
  ];

  const meusDados = await db.select().from(transactions).orderBy(desc(transactions.id));
  const minhasMetas = await db.select().from(goals); 

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
    if (resp === 'eu') return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-pink-50 text-pink-700 shrink-0">Esposa</span>;
    if (resp === 'marido') return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 shrink-0">Marido</span>;
    if (resp === 'ambos') return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 shrink-0">Dividido</span>;
    if (resp === 'casa') return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 shrink-0">Casa</span>;
  }

  // CORREÇÃO: Agora o TypeScript sabe que o banco pode ser vazio (null) nas contas antigas
  const renderTagBanco = (banco: string | null) => {
    if (!banco || banco === 'Nenhum') return null;
    let cor = 'bg-zinc-100 text-zinc-600';
    if (banco === 'Nubank') cor = 'bg-purple-100 text-purple-700 border border-purple-200';
    if (banco === 'Inter') cor = 'bg-orange-100 text-orange-700 border border-orange-200';
    if (banco === 'Mercado Pago') cor = 'bg-blue-100 text-blue-700 border border-blue-200';
    return <span className={`ml-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${cor}`}>💳 {banco}</span>;
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 font-sans pb-20">
      <header className="bg-zinc-950 border-b border-zinc-800 px-4 sm:px-8 py-4 flex flex-col xl:flex-row items-center justify-between shadow-sm gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-3 text-white font-bold text-xl w-full xl:w-auto justify-center xl:justify-start shrink-0">
          <div className="bg-gradient-to-tr from-indigo-600 to-indigo-400 p-2 rounded-xl shadow-lg shadow-indigo-900/50"><Wallet className="w-5 h-5 text-white" /></div>
          <span className="tracking-tight text-zinc-100">Controle Financeiro</span>
        </div>
        
        <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0 w-full xl:w-auto justify-start xl:justify-end scrollbar-hide">
           <BarraPesquisa /> 
           <form action={puxarFixosDoMesPassado}>
             <input type="hidden" name="mesAtual" value={mesAtual} />
             <button type="submit" className="bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 border border-amber-400/20 shrink-0" title="Copiar fixos do mês passado"><Copy className="w-4 h-4" /> <span className="hidden xl:inline">Puxar Fixos</span></button>
           </form>
           <BotaoNovo />
           <FiltroMes />
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-4 sm:p-8 pt-8 space-y-10">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Painel Principal</h1>
            <p className="text-zinc-500 mt-1 text-sm font-medium">Gestão e acompanhamento inteligente do seu dinheiro.</p>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 w-full sm:w-auto scrollbar-hide bg-white p-1.5 rounded-2xl border border-zinc-200 shadow-sm">
            {modosMenu.map((menu) => {
              const isAtivo = modoAtual === menu.id;
              return (
                <Link key={menu.id} href={`/?modo=${menu.id}&mes=${mesAtual}`} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${isAtivo ? menu.bgAtivo : `bg-transparent text-zinc-500 hover:bg-zinc-100`}`}>
                  <menu.icone className={`w-4 h-4 ${isAtivo ? 'text-white' : menu.cor}`} /> {menu.nome}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-3xl shadow-xl border border-zinc-800 p-8 relative overflow-hidden text-white flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-8 opacity-10"><PieChart className="w-48 h-48" /></div>
            <div className="relative z-10 mb-8">
              <p className="text-zinc-400 font-semibold mb-1 uppercase tracking-wider text-xs">Saldo Líquido ({modosMenu.find(m => m.id === modoAtual)?.nome})</p>
              <h2 className={`text-5xl font-black tracking-tighter ${saldoLiquido < 0 ? 'text-red-400' : 'text-white'}`}>{formatarMoeda(saldoLiquido)}</h2>
            </div>
            <div className="relative z-10 w-full bg-zinc-800/50 rounded-full h-3 mb-2 overflow-hidden border border-zinc-700/50">
              <div className={`h-3 rounded-full transition-all duration-1000 ease-out ${percentualGasto > 85 ? 'bg-red-500' : percentualGasto > 60 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${percentualGasto}%` }}></div>
            </div>
            <p className="relative z-10 text-xs text-zinc-400 font-medium text-right">Comprometido: <strong className="text-white">{percentualGasto}%</strong></p>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-emerald-100 p-2 rounded-lg"><ArrowUpCircle className="w-5 h-5 text-emerald-600" /></div>
                <h3 className="text-zinc-500 font-bold text-sm uppercase tracking-wider">Receitas no Mês</h3>
              </div>
              <p className="text-3xl font-black text-zinc-900 ml-12">{formatarMoeda(totalReceitas)}</p>
            </div>
            
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-red-100 p-2 rounded-lg"><ArrowDownCircle className="w-5 h-5 text-red-600" /></div>
                <h3 className="text-zinc-500 font-bold text-sm uppercase tracking-wider">Despesas no Mês</h3>
              </div>
              <p className="text-3xl font-black text-zinc-900 ml-12">{formatarMoeda(totalDespesas)}</p>
            </div>

            {Object.keys(gastosPorCategoria).length > 0 && (
              <div className="sm:col-span-2 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
                 <div className="w-full md:w-1/2">
                   <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Top Categorias (Gastos)</h3>
                   <div className="flex flex-col gap-3 max-h-[200px] overflow-y-auto scrollbar-hide pr-2">
                      {Object.entries(gastosPorCategoria).sort((a, b) => b[1] - a[1]).map(([cat, val]) => (
                        <div key={cat} className="flex justify-between items-center bg-zinc-50 border border-zinc-100 p-3 rounded-2xl">
                          <p className="text-sm text-zinc-600 font-bold">{cat}</p><p className="font-black text-red-500">{formatarMoeda(val)}</p>
                        </div>
                      ))}
                   </div>
                 </div>
                 <div className="w-full md:w-1/2 flex justify-center items-center h-full"><GraficoCategorias dados={gastosPorCategoria} /></div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4 mt-4">
            <h3 className="text-xl font-black text-zinc-900 flex items-center gap-2"><Target className="w-6 h-6 text-indigo-600" /> Caixinhas & Metas</h3>
            <BotaoNovaMeta />
          </div>
          
          {minhasMetas.length === 0 ? (
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-8 text-center"><p className="text-indigo-600/70 text-sm font-semibold">Nenhuma caixinha criada. Guarde para o seu futuro!</p></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {minhasMetas.map(meta => {
                 const progresso = Math.min(Math.round((meta.currentAmount / meta.targetAmount) * 100), 100);
                 return (
                   <div key={meta.id} className="bg-white border border-zinc-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative">
                     <div className="flex justify-between items-start mb-4"><h4 className="font-bold text-zinc-900 text-lg">{meta.title}</h4><form action={deletarMeta}><input type="hidden" name="id" value={meta.id}/><button type="submit" className="text-zinc-300 hover:text-red-500 transition-colors p-1"><Trash2 className="w-4 h-4"/></button></form></div>
                     <p className="text-3xl font-black text-indigo-600">{formatarMoeda(meta.currentAmount)}</p>
                     <p className="text-xs text-zinc-400 font-bold mt-1">Meta: {formatarMoeda(meta.targetAmount)}</p>
                     <div className="w-full bg-zinc-100 rounded-full h-2.5 mt-5 mb-2 overflow-hidden border border-zinc-200/50"><div className="h-full rounded-full bg-indigo-500 transition-all duration-1000 ease-out" style={{width: `${progresso}%`}}></div></div>
                     <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-4"><span>{progresso}%</span><span>Faltam {formatarMoeda(meta.targetAmount - meta.currentAmount)}</span></div>
                     <BotaoGuardarDinheiro meta={meta} />
                   </div>
                 )
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-zinc-100 bg-white flex items-center justify-between">
                <div className="flex items-center gap-2"><ArrowUpCircle className="w-6 h-6 text-emerald-500" /><h2 className="text-lg font-black text-zinc-900">Entradas</h2></div>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">{listaEntradas.length} lançamentos</span>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm text-left">
                  <thead className="bg-zinc-50/50 text-zinc-400 text-xs uppercase tracking-wider">
                    <tr><th className="px-6 py-4 font-semibold">Origem</th><th className="px-6 py-4 font-semibold">Valor</th><th className="px-6 py-4 font-semibold text-right">Ações</th></tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {listaEntradas.length === 0 ? (
                      <tr><td colSpan={3} className="px-6 py-10 text-center text-zinc-400 font-medium">Nenhuma entrada registada.</td></tr>
                    ) : (
                      listaEntradas.map((item) => (
                        <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="font-bold text-zinc-900 mb-1">{item.title} {item.isFixed && <span className="ml-2 text-[9px] bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full uppercase">Fixo</span>}</div>
                            <div className="flex items-center gap-2 text-xs text-zinc-500"><CalendarDays className="w-3 h-3" /> Dia {item.dueDateDay || "--"} • {renderTagDono(item.responsavel || "eu")}</div>
                          </td>
                          <td className="px-6 py-4 font-black text-emerald-600 whitespace-nowrap">+ {formatarMoeda(item.amount)}</td>
                          <td className="px-6 py-4 flex items-center justify-end gap-2">
                            <form action={mudarStatus}><input type="hidden" name="id" value={item.id} /><input type="hidden" name="statusAtual" value={item.status || "pending"} />
                              <button type="submit" className={`p-1.5 rounded-lg transition-colors ${item.status === 'paid' ? 'text-emerald-600 bg-emerald-50' : 'text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50'}`} title="Marcar como recebido">
                                {item.status === 'paid' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                              </button>
                            </form>
                            <BotaoEditar item={item} />
                            <form action={deletarTransacao}><input type="hidden" name="id" value={item.id} /><button type="submit" className="text-zinc-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button></form>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-zinc-100 bg-white flex items-center justify-between">
                <div className="flex items-center gap-2"><ArrowDownCircle className="w-6 h-6 text-red-500" /><h2 className="text-lg font-black text-zinc-900">Despesas</h2></div>
                <span className="bg-red-50 text-red-700 text-xs font-bold px-3 py-1 rounded-full">{listaDespesas.length} contas</span>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm text-left">
                  <thead className="bg-zinc-50/50 text-zinc-400 text-xs uppercase tracking-wider">
                    <tr><th className="px-6 py-4 font-semibold">Conta</th><th className="px-6 py-4 font-semibold">Valor</th><th className="px-6 py-4 font-semibold text-right">Ações</th></tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {listaDespesas.length === 0 ? (
                      <tr><td colSpan={3} className="px-6 py-10 text-center text-zinc-400 font-medium">Nenhuma despesa registada. Ufa!</td></tr>
                    ) : (
                      listaDespesas.map((item) => (
                        <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="font-bold text-zinc-900 mb-1">{item.title} {item.isFixed && <span className="ml-2 text-[9px] bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full uppercase">Fixo</span>} {renderTagBanco(item.banco)}</div>
                            <div className="flex items-center gap-2 text-xs text-zinc-500"><CalendarDays className="w-3 h-3" /> Dia {item.dueDateDay || "--"} • {renderTagDono(item.responsavel || "eu")}</div>
                          </td>
                          <td className="px-6 py-4 font-black text-red-500 whitespace-nowrap">- {formatarMoeda(item.amount)}</td>
                          <td className="px-6 py-4 flex items-center justify-end gap-2">
                            <form action={mudarStatus}><input type="hidden" name="id" value={item.id} /><input type="hidden" name="statusAtual" value={item.status || "pending"} />
                              <button type="submit" className={`p-1.5 rounded-lg transition-colors ${item.status === 'paid' ? 'text-emerald-600 bg-emerald-50' : 'text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50'}`} title="Marcar como pago">
                                {item.status === 'paid' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                              </button>
                            </form>
                            <BotaoEditar item={item} />
                            <form action={deletarTransacao}><input type="hidden" name="id" value={item.id} /><button type="submit" className="text-zinc-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button></form>
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