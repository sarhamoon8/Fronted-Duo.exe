import { autenticarContraBackend } from "../_shared";

/** POST /api/auth/register → POST {API_URL}/auth/register + cookie httpOnly. */
export async function POST(request: Request) {
  return autenticarContraBackend("/auth/register", request);
}
