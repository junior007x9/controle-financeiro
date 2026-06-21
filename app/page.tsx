import { Wallet, ArrowUpCircle, ArrowDownCircle, CalendarDays, Trash2, Users, User, PieChart, Home as HomeIcon, Copy, Target, CheckCircle2, Circle, TrendingUp, BarChart2, AlertCircle, Clock } from "lucide-react";
import BotaoNovo from "./BotaoNovo";
import BotaoEditar from "./BotaoEditar";
import FiltroMes from "./FiltroMes";
import BarraPesquisa from "./BarraPesquisa"; 
import BotaoNovaMeta from "./BotaoNovaMeta"; 
import BotaoGuardarDinheiro from "./BotaoGuardarDinheiro";
import GraficoCategorias from "./GraficoCategorias"; 
import GraficoCartoes from "./GraficoCartoes"; // <-- NOVO GRÁFICO IMPORTADO
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

  // --- NOVA LÓGICA DE SALDOS (ATUAL VS PREVISTO) ---
  const totalReceitasPrevistas = listaEntradas.reduce((acc, t) => acc + t.amount, 0);
  const totalDespesasPrevistas = listaDespesas.reduce((acc, t) => acc + t.amount, 0);
  const saldoPrevisto = totalReceitasPrevistas - totalDespesasPrevistas;

  const receitasPagas = listaEntradas.filter(t => t.status === 'paid').reduce((acc, t) => acc + t.amount, 0);
  const despesasPagas = listaDespesas.filter(t => t.status === 'paid').reduce((acc, t) => acc + t.amount, 0);
  const saldoAtualReal = receitasPagas - despesasPagas;

  const percentualGasto = totalReceitasPrevistas > 0 ? Math.min(Math.round((totalDespesasPrevistas / totalReceitasPrevistas) * 100), 100) : 0;
  
  const gastosPorCategoria = listaDespesas.reduce((acc, t) => {
    const cat = t.categoria || 'Outros';
    acc[cat] = (acc[cat] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  // --- NOVA LÓGICA DE GASTOS POR CARTÃO ---
  const gastosPorCartao = listaDespesas.reduce((acc, t) => {
    if (t.banco && t.banco !== 'Nenhum') {
      acc[t.banco] = (acc[t.banco] || 0) + t.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const dadosFiltradosPorDonoCompleto = meusDados.filter((t) => {
    let donoCerto = true;
    if (modoAtual === "esposa") donoCerto = t.responsavel === "eu";
    if (modoAtual === "marido") donoCerto = t.responsavel === "marido";
    if (modoAtual === "casa") donoCerto = t.responsavel === "casa" || t.responsavel === "ambos";
    return donoCerto;
  });

  const evolucaoAgrupada = dadosFiltradosPorDonoCompleto.reduce((acc, t) => {
    const anoMes = t.date.substring(0, 7); 
    if (!acc[anoMes]) acc[anoMes] = { mes: anoMes, receitas: 0, despesas: 0 };
    if (t.type === 'income') acc[anoMes].receitas += t.amount;
    if (t.type === 'expense') acc[anoMes].despesas += t.amount;
    return acc;
  }, {} as Record<string, { mes: string, receitas: number, despesas: number }>);

  const listaEvolucaoSrt = Object.values(evolucaoAgrupada).sort((a, b) => a.mes.localeCompare(b.mes));
  const formatarMoeda = (valor: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  const formatarMesAnoExtenso = (anoMesStr: string) => {
    const [ano, mes] = anoMesStr.split("-");
    const data = new Date(Number(ano), Number(mes) - 1, 2);
    return new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(data);
  };

  const renderTagDono = (resp: string) => {
    if (resp === 'eu') return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-pink-50 text-pink-700">Esposa</span>;
    if (resp === 'marido') return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700">Marido</span>;
    if (resp === 'ambos') return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700">Dividido</span>;
    if (resp === 'casa') return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700">Casa</span>;
  }

  const renderTagBanco = (banco: string | null) => {
    if (!banco || banco === 'Nenhum') return null;
    let cor = 'bg-zinc-100 text-zinc-600';
    if (banco === 'Nubank') cor = 'bg-purple-100 text-purple-700 border border-purple-200';
    if (banco === 'Inter') cor = 'bg-orange-100 text-orange-700 border border-orange-200';
    if (banco === 'Mercado Pago') cor = 'bg-blue-100 text-blue-700 border border-blue-200';
    return <span className={`ml-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${cor}`}>💳 {banco}</span>;
  }

  // --- VARIÁVEIS DE DATA PARA O ALERTA DE VENCIMENTO ---
  const dataHoje = new Date();
  const diaHoje = dataHoje.getDate();
  const mesAtualReal = dataHoje.getMonth() + 1;
  const anoAtualReal = dataHoje.getFullYear();

  return (
    <div className="min-h-screen bg-zinc-50/50 font-sans pb-20">
      <header className="bg-zinc-950 border-b border-zinc-800 px-4 sm:px-8 py-4 flex flex-col xl:flex-row items-center justify-between shadow-md gap-4 sticky top-0 z-40">
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

        {/* --- GRID DE CIMA: CARTÃO DE SALDOS E RESUMO --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* CARTÃO PREMIUM DE SALDOS DUPLOS */}
          <div className="lg:col-span-1 bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-3xl shadow-xl border border-zinc-800 p-8 relative overflow-hidden text-white flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-8 opacity-10"><PieChart className="w-48 h-48" /></div>
            <div className="relative z-10 mb-6">
              <p className="text-emerald-400 font-bold mb-1 uppercase tracking-wider text-xs flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Saldo Atual (Na Conta)</p>
              <h2 className={`text-5xl font-black tracking-tighter ${saldoAtualReal < 0 ? 'text-red-400' : 'text-white'}`}>{formatarMoeda(saldoAtualReal)}</h2>
            </div>
            
            <div className="relative z-10 bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50 backdrop-blur-sm mb-4">
               <p className="text-zinc-400 font-semibold mb-1 uppercase tracking-wider text-[10px] flex items-center gap-1.5"><Clock className="w-3 h-3"/> Previsão Fim do Mês</p>
               <h3 className={`text-xl font-bold ${saldoPrevisto < 0 ? 'text-red-400' : 'text-zinc-100'}`}>{formatarMoeda(saldoPrevisto)}</h3>
            </div>

            <div className="relative z-10 w-full bg-zinc-800/50 rounded-full h-3 mb-2 overflow-hidden border border-zinc-700/50">
              <div className={`h-3 rounded-full transition-all duration-1000 ease-out ${percentualGasto > 85 ? 'bg-red-500' : percentualGasto > 60 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${percentualGasto}%` }}></div>
            </div>
            <p className="relative z-10 text-xs text-zinc-400 font-medium text-right">Gastos Previstos: <strong className="text-white">{percentualGasto}%</strong> da renda</p>
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-center relative overflow-hidden">
              <div className="flex items-center gap-3 mb-2 relative z-10">
                <div className="bg-emerald-100 p-2 rounded-lg"><ArrowUpCircle className="w-5 h-5 text-emerald-600" /></div>
                <h3 className="text-zinc-500 font-bold text-sm uppercase tracking-wider">Receitas Previstas</h3>
              </div>
              <p className="text-3xl font-black text-zinc-900 ml-12 relative z-10">{formatarMoeda(totalReceitasPrevistas)}</p>
              <div className="absolute right-0 bottom-0 bg-emerald-50 text-emerald-600 font-bold text-xs px-3 py-1.5 rounded-tl-xl border-t border-l border-emerald-100">Já recebido: {formatarMoeda(receitasPagas)}</div>
            </div>
            
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-center relative overflow-hidden">
              <div className="flex items-center gap-3 mb-2 relative z-10">
                <div className="bg-red-100 p-2 rounded-lg"><ArrowDownCircle className="w-5 h-5 text-red-600" /></div>
                <h3 className="text-zinc-500 font-bold text-sm uppercase tracking-wider">Despesas Previstas</h3>
              </div>
              <p className="text-3xl font-black text-zinc-900 ml-12 relative z-10">{formatarMoeda(totalDespesasPrevistas)}</p>
              <div className="absolute right-0 bottom-0 bg-red-50 text-red-600 font-bold text-xs px-3 py-1.5 rounded-tl-xl border-t border-l border-red-100">Já pago: {formatarMoeda(despesasPagas)}</div>
            </div>

            {/* --- NOVA LINHA DE GRÁFICOS (CATEGORIAS + CARTÕES) --- */}
            <div className="sm:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* BLOCO PIZZA: CATEGORIAS */}
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col items-center">
                 <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 w-full text-left">Top Categorias (Pizza)</h3>
                 {Object.keys(gastosPorCategoria).length > 0 ? (
                   <div className="w-full h-[220px]"><GraficoCategorias dados={gastosPorCategoria} /></div>
                 ) : <div className="flex h-full items-center text-zinc-400 text-sm font-medium">Nenhum dado.</div>}
              </div>

              {/* BLOCO BARRAS: CARTÕES */}
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col items-center">
                 <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 w-full text-left">Faturas de Cartão</h3>
                 <div className="w-full h-[220px]"><GraficoCartoes dados={gastosPorCartao} /></div>
              </div>

            </div>
          </div>
        </div>

        {listaEvolucaoSrt.length > 0 && (
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-black text-zinc-900 mb-4 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-indigo-600" /> Evolução Patrimonial (Histórico Mensal)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {listaEvolucaoSrt.map((item) => {
                const liq = item.receitas - item.despesas;
                return (
                  <div key={item.mes} className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl flex flex-col justify-between shadow-inner">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 capitalize">{formatarMesAnoExtenso(item.mes)}</p>
                    <div><p className="text-xs font-semibold text-zinc-500">Saldo Final:</p><p className={`font-black text-base tracking-tight ${liq >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{formatarMoeda(liq)}</p></div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ... CAIXINHAS ... */}
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
                        <tr key={item.id} className="hover:bg-zinc-50/80 transition-colors group border-l-4 border-transparent">
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

            {/* TABELA 2: SAÍDAS COM ANEL DE URGÊNCIA */}
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
                      listaDespesas.map((item) => {
                        // --- LÓGICA DE URGÊNCIA (CORES DA LINHA) ---
                        const anoDaConta = parseInt(item.date.split('-')[0]);
                        const mesDaConta = parseInt(item.date.split('-')[1]);
                        
                        let rowClass = "hover:bg-zinc-50/80 transition-colors group border-l-4 border-transparent";
                        let tagAtraso = null;

                        if (item.status === "pending") {
                           const isContaPassada = (anoDaConta < anoAtualReal) || (anoDaConta === anoAtualReal && mesDaConta < mesAtualReal);
                           const isVencidaHoje = !isContaPassada && (mesDaConta === mesAtualReal) && item.dueDateDay && (item.dueDateDay < diaHoje);

                           if (isContaPassada || isVencidaHoje) {
                               rowClass = "bg-red-50/30 hover:bg-red-50 transition-colors group border-l-4 border-red-500";
                               tagAtraso = <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-md mt-1.5 w-fit animate-pulse"><AlertCircle className="w-3 h-3"/> Vencida</span>;
                           } else if (item.dueDateDay && (item.dueDateDay - diaHoje <= 3) && (item.dueDateDay - diaHoje >= 0) && mesDaConta === mesAtualReal) {
                               rowClass = "bg-amber-50/30 hover:bg-amber-50 transition-colors group border-l-4 border-amber-400";
                               tagAtraso = <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md mt-1.5 w-fit"><Clock className="w-3 h-3"/> Vence logo</span>;
                           }
                        }

                        return (
                          <tr key={item.id} className={rowClass}>
                            <td className="px-6 py-4">
                              <div className="font-bold text-zinc-900 mb-1">{item.title} {item.isFixed && <span className="ml-2 text-[9px] bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded-full uppercase">Fixo</span>} {renderTagBanco(item.banco)}</div>
                              <div className="flex items-center gap-2 text-xs text-zinc-500"><CalendarDays className="w-3 h-3" /> Dia {item.dueDateDay || "--"} • {renderTagDono(item.responsavel || "eu")}</div>
                              {tagAtraso}
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
                        )
                      })
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