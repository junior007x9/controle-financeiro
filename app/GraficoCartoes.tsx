"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function GraficoCartoes({ dados }: { dados: Record<string, number> }) {
  const data = Object.entries(dados).map(([name, value]) => ({ name, value }));

  if (data.length === 0) return (
    <div className="flex h-full items-center justify-center text-zinc-400 text-sm font-medium">
      Nenhum gasto no cartão este mês.
    </div>
  );

  const formatarMoeda = (valor: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

  // Cores dinâmicas para cada banco
  const getCorBanco = (nome: string) => {
    if (nome === 'Nubank') return '#9333ea'; // Roxo
    if (nome === 'Inter') return '#f97316';  // Laranja
    if (nome === 'Mercado Pago') return '#3b82f6'; // Azul
    return '#a1a1aa'; // Cinza para outros
  };

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600, fill: '#71717a' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={(val) => `R$ ${val}`} tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
          <Tooltip 
            cursor={{ fill: '#f4f4f5' }}
            formatter={(value: any) => formatarMoeda(Number(value))}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getCorBanco(entry.name)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}