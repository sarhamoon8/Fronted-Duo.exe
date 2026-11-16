import { reenviarAlBackend } from "../_shared";

/** POST /api/auth/olvide-contrasena → POST {API_URL}/auth/olvide-contrasena (pública, sin cookie). */
export async function POST(request: Request) {
  return reenviarAlBackend("/auth/olvide-contrasena", request);
}
