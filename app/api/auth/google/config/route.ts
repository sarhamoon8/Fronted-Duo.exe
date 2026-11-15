import { NextResponse } from "next/server";
import { serverEnv } from "@/config/env";

/**
 * GET /api/auth/google/config → { clientId }. El Client ID de Google se lee en
 * tiempo de ejecución (variable GOOGLE_CLIENT_ID del servidor), así no hay que
 * reconstruir la imagen para activarlo. Es un dato público (va en el botón).
 */
export function GET() {
  return NextResponse.json({ clientId: serverEnv.googleClientId });
}
