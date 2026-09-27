import { NextResponse } from "next/server";
import { serverEnv } from "@/config/env";

/**
 * El backend no tiene endpoint de logout (JWT sin estado): cerrar sesión
 * es simplemente borrar la cookie.
 */
export async function POST() {
  const res = new NextResponse(null, { status: 204 });
  res.cookies.set(serverEnv.authCookieName, "", { path: "/", maxAge: 0 });
  return res;
}
