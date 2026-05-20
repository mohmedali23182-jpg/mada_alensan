import { authenticateBearerToken } from "@/lib/api-token-auth";
import { jsonOk } from "@/lib/http-json";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const { user, errorResponse } = await authenticateBearerToken();
  if (errorResponse) return errorResponse;

  return jsonOk({ user });
}
