import { NextResponse, type NextRequest } from "next/server";
import { serverEnv } from "@/config/env";
import { crearBackendClient } from "@/server/backend-client";
import { leerToken } from "@/server/session";

/**
 * BFF (Backend For Frontend): proxy genérico /api/bff/* → {API_URL}/*.
 *
 * 1. Lee el JWT de la cookie httpOnly y lo envía como Authorization: Bearer.
 * 2. Reenvía método, query string y cuerpo JSON sin transformarlos.
 * 3. Devuelve el status y el cuerpo originales del backend (incluidos
 *    los 400/401/403/404/409 de NestJS), así el frontend ve el mismo
 *    contrato que Postman.
 *
 * Solo se permiten los recursos que existen en el backend; /auth tiene sus
 * propios Route Handlers porque debe gestionar la cookie.
 */
const RECURSOS_PERMITIDOS = /^(entidades-medicas|servicios|turnos|usuarios)(\/|$)/;
const METODOS_CON_CUERPO = new Set(["POST", "PUT", "PATCH", "DELETE"]);

async function proxy(request: NextRequest, ctx: RouteContext<"/api/bff/[...path]">) {
  const { path } = await ctx.params;
  const ruta = path.map(encodeURIComponent).join("/");

  if (!RECURSOS_PERMITIDOS.test(ruta)) {
    return NextResponse.json(
      { message: "Recurso no disponible", error: "Not Found", statusCode: 404 },
      { status: 404 },
    );
  }

  // Protección CSRF básica: las mutaciones deben venir de nuestro propio origen.
  if (METODOS_CON_CUERPO.has(request.method)) {
    const origin = request.headers.get("origin");
    if (origin && origin !== request.nextUrl.origin) {
      return NextResponse.json(
        { message: "Origen no permitido", error: "Forbidden", statusCode: 403 },
        { status: 403 },
      );
    }
  }

  const token = await leerToken();
  const texto = METODOS_CON_CUERPO.has(request.method) ? await request.text() : "";

  let res;
  try {
    res = await crearBackendClient(token ?? undefined).request({
      method: request.method,
      url: `/${ruta}`,
      params: Object.fromEntries(request.nextUrl.searchParams),
      data: texto || undefined,
      headers: texto ? { "Content-Type": "application/json" } : undefined,
      responseType: "text",
      transformResponse: (d) => d, // no parsear: reenviamos el cuerpo tal cual
    });
  } catch {
    return NextResponse.json(
      { message: "No fue posible conectar con el servidor de FilaCero.", error: "Bad Gateway", statusCode: 502 },
      { status: 502 },
    );
  }

  const respuesta = new NextResponse(res.status === 204 ? null : (res.data as string), {
    status: res.status,
    headers: {
      "Content-Type": String(res.headers["content-type"] ?? "application/json"),
      "Cache-Control": "no-store",
    },
  });

  // Token rechazado por el backend: limpiamos la cookie.
  if (res.status === 401 && token) {
    respuesta.cookies.set(serverEnv.authCookieName, "", { path: "/", maxAge: 0 });
  }
  return respuesta;
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
