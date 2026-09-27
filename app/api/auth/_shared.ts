import { NextResponse } from "next/server";
import { serverEnv } from "@/config/env";
import { crearBackendClient } from "@/server/backend-client";
import { construirSesion, maxAgeDesdeToken, opcionesCookie } from "@/server/session";

/**
 * Llama a POST /auth/login o /auth/register del backend. Si responde
 * { accessToken }, lo guarda en una cookie httpOnly y devuelve la sesión
 * (sin el token) al navegador. Los errores del backend se reenvían tal cual.
 */
export async function autenticarContraBackend(
  ruta: "/auth/login" | "/auth/register",
  request: Request,
) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Cuerpo JSON inválido", error: "Bad Request", statusCode: 400 },
      { status: 400 },
    );
  }

  let res;
  try {
    res = await crearBackendClient().post<{ accessToken?: string }>(ruta, body);
  } catch {
    return errorSinBackend();
  }

  if (res.status < 200 || res.status >= 300 || !res.data?.accessToken) {
    return NextResponse.json(res.data, { status: res.status >= 400 ? res.status : 502 });
  }

  const token = res.data.accessToken;
  const sesion = await construirSesion(token);
  if (!sesion) {
    return NextResponse.json(
      { message: "El token recibido no es válido", error: "Bad Gateway", statusCode: 502 },
      { status: 502 },
    );
  }

  const respuesta = NextResponse.json({ sesion }, { status: 200 });
  respuesta.cookies.set(serverEnv.authCookieName, token, opcionesCookie(maxAgeDesdeToken(token)));
  return respuesta;
}

export function errorSinBackend() {
  return NextResponse.json(
    {
      message: "No fue posible conectar con el servidor de FilaCero.",
      error: "Bad Gateway",
      statusCode: 502,
    },
    { status: 502 },
  );
}
