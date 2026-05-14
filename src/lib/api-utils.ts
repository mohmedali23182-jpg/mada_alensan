export async function readBody(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
    const form = await request.formData();
    return { kind: "form" as const, form, data: Object.fromEntries(form.entries()) };
  }
  const data = await request.json().catch(() => null);
  return { kind: "json" as const, form: null, data };
}

export function formFiles(form: FormData | null, names = ["files", "attachments", "coverImage", "avatar"]): File[] {
  if (!form) return [];
  const files: File[] = [];
  for (const name of names) {
    for (const value of form.getAll(name)) {
      if (value instanceof File && value.size > 0) files.push(value);
    }
  }
  return files;
}

export function normalizeEmptyStrings<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, value === "" ? undefined : value])
  ) as T;
}
