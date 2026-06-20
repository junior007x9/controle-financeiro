"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function FiltroMes() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const modoAtual = searchParams.get("modo") || "casal";
  const mesParam = searchParams.get("mes");

  // Pega o mês da URL ou o mês atual de hoje
  const dataAtual = mesParam ? new Date(mesParam + "-02T00:00:00") : new Date();
  
  // Formata para português (ex: "junho de 2026")
  const formatador = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
  const nomeMes = formatador.format(dataAtual);

  function mudarMes(direcao: number) {
    const novaData = new Date(dataAtual);
    novaData.setMonth(novaData.getMonth() + direcao);
    
    const novoMes = novaData.toISOString().split("T")[0].substring(0, 7); // Ex: "2026-07"
    router.push(`/?modo=${modoAtual}&mes=${novoMes}`);
  }

  return (
    <div className="flex items-center justify-between bg-white border border-zinc-200 rounded-lg px-2 py-1.5 shadow-sm min-w-[200px]">
      <button onClick={() => mudarMes(-1)} className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors">
        <ChevronLeft className="w-5 h-5 text-zinc-600" />
      </button>
      <span className="font-bold text-zinc-800 capitalize text-sm">
        {nomeMes}
      </span>
      <button onClick={() => mudarMes(1)} className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors">
        <ChevronRight className="w-5 h-5 text-zinc-600" />
      </button>
    </div>
  );
}