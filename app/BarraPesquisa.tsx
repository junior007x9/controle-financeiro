"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export default function BarraPesquisa() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const modoAtual = searchParams.get("modo") || "casal";
  const mesAtual = searchParams.get("mes") || "";
  const buscaAtual = searchParams.get("busca") || "";

  let timeoutId: NodeJS.Timeout;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearTimeout(timeoutId);
    const text = e.target.value;

    // Aguarda meio segundo após parar de digitar para atualizar (Debounce)
    timeoutId = setTimeout(() => {
      router.push(`/?modo=${modoAtual}&mes=${mesAtual}&busca=${text}`);
    }, 400); 
  };

  return (
    <div className="relative w-full sm:w-48 shrink-0">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
      <input
        type="text"
        defaultValue={buscaAtual}
        onChange={handleSearch}
        placeholder="Pesquisar..."
        className="w-full pl-9 pr-4 py-2.5 border border-zinc-700 bg-zinc-800 text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 placeholder-zinc-400 shadow-sm transition-colors"
      />
    </div>
  );
}