import { NextResponse, type NextRequest } from "next/server";
import { decodificarJwt, tokenExpirado } from "@/server/jwt";
import type { Rol } from "@/core/domain/entities/rol";

/**
 * Proxy de Next.js 16 (antes "middleware"). Protección optimista de rutas:
 * solo mira si hay cookie con un JWT no expirado y el rol. La autorización
 * real la sigue haciendo el backend (JwtAuthGuard + RolesGuard).
 */
const COOKIE = process.env.AUTH_COOKIE_NAME ?? "filacero_token";

const TODOS: Rol[] = ["PACIENTE", "FUNCIONARIO", "ADMIN"];
const RUTAS_POR_ROL: { prefijo: string; roles: Rol[] }[] = [
  { prefijo: "/admin", roles: ["ADMIN"] },
  { prefijo: "/fila", roles: ["FUNCIONARIO", "ADMIN"] },
  { prefijo: "/turnos", roles: TODOS },
  { prefijo: "/medicamentos", roles: TODOS },
  { prefijo: "/historial", roles: TODOS },
  { prefijo: "/farmacia", roles: TODOS },
  { prefijo: "/inicio", roles: TODOS },
];

/** Página de inicio de cada rol (igual que INICIO_POR_ROL en la navegación). */
const INICIO: Record<Rol, string> = { PACIENTE: "/inicio", FUNCIONARIO: "/fila", ADMIN: "/admin" };
const RUTAS_INVITADO = ["/login", "/registro"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(COOKIE)?.value;
  const payload = token ? decodificarJwt(token) : null;
  const autenticado = !!payload && !tokenExpirado(payload);

  // Invitados que ya tienen sesión → al inicio.
  if (RUTAS_INVITADO.some((r) => pathname.startsWith(r))) {
    return autenticado ? NextResponse.redirect(new URL(INICIO[payload!.rol], request.url)) : NextResponse.next();
  }

  const regla = RUTAS_POR_ROL.find((r) => pathname.startsWith(r.prefijo));
  if (!regla) return NextResponse.next();

  if (!autenticado) {
    const login = new URL("/login", request.url);
    login.searchParams.set("siguiente", pathname + search);
    if (token) login.searchParams.set("expirada", "1");
    const res = NextResponse.redirect(login);
    if (token) res.cookies.set(COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  }

  if (!regla.roles.includes(payload!.rol)) {
    return NextResponse.redirect(new URL(`${INICIO[payload!.rol]}?sinPermiso=1`, request.url));
  }
  // Cada rol tiene su propia portada.
  if (pathname === "/inicio" && payload!.rol !== "PACIENTE") {
    return NextResponse.redirect(new URL(INICIO[payload!.rol], request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/inicio/:path*",
    "/turnos/:path*",
    "/medicamentos/:path*",
    "/historial/:path*",
    "/fila/:path*",
    "/farmacia/:path*",
    "/admin/:path*",
    "/login",
    "/registro",
  ],
};
