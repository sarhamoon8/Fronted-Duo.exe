import { defineConfig, devices } from "@playwright/test";

/**
 * E2E contra el stack completo (frontend + backend real + Postgres real).
 *
 * Precondiciones (igual que stress/README.md del backend):
 *   1. La base de datos y el backend deben estar arriba (docker compose up,
 *      o `npm run start:dev` en filacero-backend) en http://localhost:3000.
 *   2. `npm run db:seed` corrido al menos una vez en el backend (usa las
 *      credenciales de demo: paciente@filacero.demo / FilaCero2026!, etc.).
 *
 * Playwright solo administra el servidor de Next (lo levanta si no está
 * corriendo); el backend es responsabilidad de quien corre la suite.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3001",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3001",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
