import { NextResponse } from "next/server";
import { serverEnv } from "@/config/env";
import { construirSesion, leerToken } from "@/server/session";

/** GET /api/auth/session → la sesión actual (sin el token) o 401. */
export async function GET() {
  const token = await leerToken();
  const sesion = token ? await construirSesion(token) : null;
  if (!sesion) {
    const res = NextResponse.json(
      { message: "No hay una sesión activa", error: "Unauthorized", statusCode: 401 },
      { status: 401 },
    );
    if (token) res.cookies.set(serverEnv.authCookieName, "", { path: "/", maxAge: 0 });
    return res;
  }
  return NextResponse.json({ sesion });
}
