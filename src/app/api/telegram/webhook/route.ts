import { NextResponse } from "next/server";
import { handleTelegramUpdate, type TelegramUpdate } from "@/lib/telegram";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isValidSecret(request: Request) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  
  // إذا لم يكن السر موجوداً في البيئة، نسجل تحذيراً ونسمح بالمرور (حسب المطلوب في الخطوة 5)
  if (!expected) {
    console.warn("WARNING: TELEGRAM_WEBHOOK_SECRET is not defined in environment variables.");
    return true; 
  }

  const headerSecret = request.headers.get("x-telegram-bot-api-secret-token");
  return headerSecret === expected;
}

export async function POST(request: Request) {
  if (!isValidSecret(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const update = (await request.json().catch(() => null)) as TelegramUpdate | null;
  
  // إذا كانت الحمولة غير صالحة، نرجع 200 لتجنب إعادة المحاولة من تليجرام مع تسجيل الخطأ
  if (!update) {
    console.error("Invalid Telegram payload received");
    return NextResponse.json({ ok: true });
  }

  try {
    // معالجة التحديث في الخلفية أو بانتظار بسيط
    await handleTelegramUpdate(update);
    // نرجع دائماً ok: true حسب المطلوب في الخطوة 7
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook processing error:", error);
    // نرجع دائماً ok: true حتى في حالة الخطأ لتجنب تكرار الطلبات الفاشلة من تليجرام
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  // إرجاع الاستجابة المطلوبة في الخطوة 6
  return NextResponse.json({ ok: true, webhook: "telegram" });
}
