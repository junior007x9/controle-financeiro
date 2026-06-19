"use server";

import { db } from "../db";
import { transactions } from "../db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function salvarTransacao(formData: FormData) {
  const title = formData.get("title") as string;
  const amountStr = formData.get("amount") as string;
  const amount = parseFloat(amountStr.replace(",", "."));
  const type = formData.get("type") as "income" | "expense";
  const isFixed = formData.get("isFixed") === "true";
  const responsavel = formData.get("responsavel") as string;
  
  const dueDateInput = formData.get("dueDateDay");
  const dueDateDay = dueDateInput ? parseInt(dueDateInput as string) : null;
  const dataHoje = new Date().toISOString().split("T")[0];

  await db.insert(transactions).values({
    title, amount, type, isFixed, dueDateDay, responsavel,
    date: dataHoje, status: "pending",
  });

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

// NOVO: Função para salvar as edições
export async function editarTransacao(formData: FormData) {
  const id = Number(formData.get("id"));
  const title = formData.get("title") as string;
  const amountStr = formData.get("amount") as string;
  const amount = parseFloat(amountStr.replace(",", "."));
  const type = formData.get("type") as "income" | "expense";
  const isFixed = formData.get("isFixed") === "true";
  const responsavel = formData.get("responsavel") as string;
  const dueDateInput = formData.get("dueDateDay");
  const dueDateDay = dueDateInput ? parseInt(dueDateInput as string) : null;

  await db.update(transactions).set({
    title, amount, type, isFixed, dueDateDay, responsavel
  }).where(eq(transactions.id, id));

  revalidatePath("/");
}