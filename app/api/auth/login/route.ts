import { autenticarContraBackend } from "../_shared";

/** POST /api/auth/login → POST {API_URL}/auth/login + cookie httpOnly. */
export async function POST(request: Request) {
  return autenticarContraBackend("/auth/login", request);
}
