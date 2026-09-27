import "server-only";
import axios from "axios";
import { serverEnv } from "@/config/env";

/**
 * Cliente Axios de servidor hacia el backend NestJS. Solo lo usan los Route
 * Handlers y los Server Components; aquí es donde el JWT de la cookie se
 * convierte en `Authorization: Bearer <token>`, que es lo único que entiende
 * JwtAuthGuard.
 *
 * `validateStatus: () => true` hace que Axios no lance en 4xx/5xx: el BFF
 * reenvía al navegador el status y el cuerpo originales del backend.
 */
export function crearBackendClient(token?: string) {
  return axios.create({
    baseURL: serverEnv.apiUrl,
    timeout: 15_000,
    validateStatus: () => true,
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
