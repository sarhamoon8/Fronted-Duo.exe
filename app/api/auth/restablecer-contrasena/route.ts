import { reenviarAlBackend } from "../_shared";

/** POST /api/auth/restablecer-contrasena → POST {API_URL}/auth/restablecer-contrasena (pública, sin cookie). */
export async function POST(request: Request) {
  return reenviarAlBackend("/auth/restablecer-contrasena", request);
}
