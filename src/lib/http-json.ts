export type JsonResult = { ok?: boolean; message?: string; [key: string]: unknown };

export async function readJsonResponse(response: Response): Promise<JsonResult> {
  const text = await response.text();
  if (!text.trim()) {
    return { ok: false, message: "رد غير صالح من الخادم" };
  }

  try {
    return JSON.parse(text) as JsonResult;
  } catch {
    return {
      ok: false,
      message: response.headers.get("content-type")?.includes("text/html")
        ? "المسار المطلوب غير منشور كواجهة API. راجع إعدادات النشر."
        : "رد غير صالح من الخادم",
    };
  }
}
