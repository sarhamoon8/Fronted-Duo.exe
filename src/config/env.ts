/**
 * Variables de entorno tipadas.
 *
 * - `serverEnv` solo debe importarse desde código de servidor (Route Handlers,
 *   Server Components, proxy.ts). Nunca llega al navegador.
 */

export const serverEnv = {
  /** URL base del backend NestJS de FilaCero (Backend-Duo.exe). */
  get apiUrl(): string {
    return (process.env.API_URL ?? "http://localhost:3000").replace(/\/+$/, "");
  },
  /** Nombre de la cookie httpOnly donde vive el JWT. */
  get authCookieName(): string {
    return process.env.AUTH_COOKIE_NAME ?? "filacero_token";
  },
  /** Client ID de OAuth de Google ("Continuar con Google"); null si no está configurado. */
  get googleClientId(): string | null {
    return process.env.GOOGLE_CLIENT_ID?.trim() || null;
  },
  get isProduction(): boolean {
    return process.env.NODE_ENV === "production";
  },
};
