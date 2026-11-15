import { autenticarContraBackend } from "../_shared";

/** POST /api/auth/google → POST {API_URL}/auth/google + cookie httpOnly (o 428 si falta completar el registro). */
export async function POST(request: Request) {
  return autenticarContraBackend("/auth/google", request);
}
