import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export type DatabaseHealth = {
  ok: boolean;
  message: string;
  code?: string;
};

export function isMissingDatabaseSchemaError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("does not exist") ||
    message.includes("relation") ||
    message.includes("P2021") ||
    message.includes("P2022")
  );
}

export function safeServerMessage(error: unknown) {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return "تعذر الاتصال بقاعدة البيانات. تحقق من DATABASE_URL و DIRECT_URL.";
  }
  if (isMissingDatabaseSchemaError(error)) {
    return "جداول قاعدة البيانات غير منشأة بعد. شغل npx prisma db push ثم npm run seed.";
  }
  return "حدث خطأ داخلي أثناء الاتصال بقاعدة البيانات.";
}

export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  try {
    await prisma.user.count();
    return { ok: true, message: "قاعدة البيانات جاهزة وتحتوي على جدول User." };
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : undefined;
    return { ok: false, message: safeServerMessage(error), code };
  }
}
