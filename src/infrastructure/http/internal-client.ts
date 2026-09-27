"use client";

import axios, { AxiosError } from "axios";
import { normalizarError } from "./normalizar-error";

/**
 * Cliente HTTP #1 — API interna (backend NestJS de FilaCero).
 *
 * El navegador NUNCA habla directo con el backend ni ve el JWT:
 *   navegador ──(cookie httpOnly)──▶ /api/* (Route Handlers de Next.js)
 *            ──(Authorization: Bearer)──▶ backend NestJS
 *
 * - /api/auth/*  → login, registro, logout y sesión (gestionan la cookie).
 * - /api/bff/*   → proxy genérico hacia los endpoints del backend.
 *
 * `withCredentials` garantiza que la cookie viaje también si en el futuro
 * el frontend y el BFF quedan en orígenes distintos.
 */
export const internalApi = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 15_000,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
});

type ManejadorSesionExpirada = () => void;
let alExpirarSesion: ManejadorSesionExpirada | null = null;

/** La capa de presentación registra aquí qué hacer ante un 401. */
export function registrarManejadorSesionExpirada(fn: ManejadorSesionExpirada) {
  alExpirarSesion = fn;
}

internalApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const url = error.config?.url ?? "";
    const esRutaAuth = url.startsWith("/auth/") || url.startsWith("auth/");
    if (error.response?.status === 401 && !esRutaAuth) {
      alExpirarSesion?.();
    }
    return Promise.reject(normalizarError(error, "interna"));
  },
);
