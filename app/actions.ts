"use server";

import { db } from "../db";
import { transactions, goals } from "../db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function salvarTransacao(formData: FormData) {
  const title = formData.get("title") as string;
  const amountStr = formData.get("amount") as string;
  const amount = parseFloat(amountStr.replace(/\./g, "").replace(",", "."));
  const type = formData.get("type") as "income" | "expense";
  const isFixed = formData.get("isFixed") === "true";
  const responsavel = formData.get("responsavel") as string;
  const categoria = formData.get("categoria") as string; 
  const banco = formData.get("banco") as string || "Nenhum"; // LÊ O CARTÃO
  
  const parcelasStr = formData.get("parcelas") as string;
  const parcelas = parcelasStr ? parseInt(parcelasStr) : 1;
  const dueDateInput = formData.get("dueDateDay");
  const dueDateDay = dueDateInput ? parseInt(dueDateInput as string) : null;
  const dataHoje = new Date();

  // LOOP DE PARCELAMENTO AUTOMÁTICO
  for (let i = 0; i < parcelas; i++) {
    const dataLancamento = new Date(dataHoje.getFullYear(), dataHoje.getMonth() + i, dataHoje.getDate());
    const dataFormatada = dataLancamento.toISOString().split("T")[0];
    const tituloFinal = parcelas > 1 ? `${title} (${i + 1}/${parcelas})` : title;

    await db.insert(transactions).values({
      title: tituloFinal, amount, type, isFixed, dueDateDay, responsavel, categoria, banco,
      date: dataFormatada, status: "pending",
    });
  }
  revalidatePath("/");
}

export async function mudarStatus(formData: FormData) {
  const id = Number(formData.get("id"));
  const statusAtual = formData.get("statusAtual") as string;
  const novoStatus = statusAtual === "pending" ? "paid" : "pending";
  await db.update(transactions).set({ status: novoStatus }).where(eq(transactions.id, id));
  revalidatePath("/");
}

export async function deletarTransacao(formData: FormData) {
  const id = Number(formData.get("id"));
  await db.delete(transactions).where(eq(transactions.id, id));
  revalidatePath("/");
}

export async function editarTransacao(formData: FormData) {
  const id = Number(formData.get("id"));
  const title = formData.get("title") as string;
  const amountStr = formData.get("amount") as string;
  const amount = parseFloat(amountStr.replace(/\./g, "").replace(",", "."));
  const type = formData.get("type") as "income" | "expense";
  const isFixed = formData.get("isFixed") === "true";
  const responsavel = formData.get("responsavel") as string;
  const banco = formData.get("banco") as string || "Nenhum";
  const dueDateInput = formData.get("dueDateDay");
  const dueDateDay = dueDateInput ? parseInt(dueDateInput as string) : null;

  await db.update(transactions).set({ title, amount, type, isFixed, dueDateDay, responsavel, banco }).where(eq(transactions.id, id));
  revalidatePath("/");
}

export async function puxarFixosDoMesPassado(formData: FormData) {
  const mesAtualStr = formData.get("mesAtual") as string;
  const dataAtual = new Date(mesAtualStr + "-02T00:00:00");
  dataAtual.setMonth(dataAtual.getMonth() - 1);
  const mesPassadoStr = dataAtual.toISOString().substring(0, 7);

  const todos = await db.select().from(transactions).where(eq(transactions.isFixed, true));
  const fixosMesPassado = todos.filter((t) => t.date.startsWith(mesPassadoStr));

  for (const item of fixosMesPassado) {
    const dataNova = new Date(item.date);
    dataNova.setMonth(dataNova.getMonth() + 1);
    const dataFormatada = dataNova.toISOString().split("T")[0];

    await db.insert(transactions).values({
      title: item.title, amount: item.amount, type: item.type, isFixed: true,
      dueDateDay: item.dueDateDay, responsavel: item.responsavel, categoria: item.categoria, banco: item.banco,
      date: dataFormatada, status: "pending",
    });
  }
  revalidatePath("/");
}

// CAIXINHAS
export async function criarMeta(formData: FormData) {
  const title = formData.get("title") as string;
  const amountStr = formData.get("targetAmount") as string;
  const targetAmount = parseFloat(amountStr.replace(/\./g, "").replace(",", "."));
  await db.insert(goals).values({ title, targetAmount, currentAmount: 0 });
  revalidatePath("/");
}
export async function guardarDinheiro(formData: FormData) {
  const id = Number(formData.get("id"));
  const amountStr = formData.get("amount") as string;
  const amount = parseFloat(amountStr.replace(/\./g, "").replace(",", "."));
  const [meta] = await db.select().from(goals).where(eq(goals.id, id));
  if (meta) await db.update(goals).set({ currentAmount: meta.currentAmount + amount }).where(eq(goals.id, id));
  revalidatePath("/");
}
export async function deletarMeta(formData: FormData) {
  const id = Number(formData.get("id"));
  await db.delete(goals).where(eq(goals.id, id));
  revalidatePath("/");
}