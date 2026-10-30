import { defineConfig } from "vitest/config";

/**
 * Pruebas de integración: llaman por HTTP real (fetch) a los Route
 * Handlers del BFF (/api/auth/*, /api/bff/*) corriendo de verdad en
 * localhost:3001, contra el backend real en localhost:3000 — sin mocks.
 *
 * No se puede probar esto llamando directo a las funciones POST/GET de
 * cada route.ts: usan `cookies()` de next/headers, que solo funciona
 * dentro del request-scope real del servidor de Next (AsyncLocalStorage),
 * no al invocarlas sueltas en un test. Por eso necesitan el servidor
 * arriba de verdad (ver integration/README.md).
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["integration/**/*.test.ts"],
    testTimeout: 15_000,
  },
});
