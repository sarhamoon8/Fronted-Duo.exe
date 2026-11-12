import { test, expect, devices } from "@playwright/test";

// Credenciales de demo creadas por `npm run db:seed` en filacero-backend
// (ver prisma/seed.ts). Si el seed no corrió, estos tests fallan con un
// mensaje claro en el login, no en silencio.
const PACIENTE = { email: "paciente@filacero.demo", password: "FilaCero2026!" };

test.describe("Autenticación (e2e, stack completo)", () => {
  test("una ruta protegida sin sesión redirige a /login con 'siguiente'", async ({ page }) => {
    await page.goto("/turnos");
    await expect(page).toHaveURL(/\/login\?siguiente=%2Fturnos/);
  });

  test("login con credenciales inválidas muestra el error del backend", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/correo electrónico/i).fill(PACIENTE.email);
    await page.getByLabel(/contraseña/i).fill("contraseña-incorrecta");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();

    await expect(page.getByText(/sesión no es válida|credenciales/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("login con las credenciales de demo lleva a /inicio", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/correo electrónico/i).fill(PACIENTE.email);
    await page.getByLabel(/contraseña/i).fill(PACIENTE.password);
    await page.getByRole("button", { name: "Iniciar sesión" }).click();

    await expect(page).toHaveURL(/\/inicio/);
  });

  test("registrar un paciente nuevo crea la cuenta y autentica de una vez", async ({ page }) => {
    const sufijo = Date.now().toString();
    await page.goto("/registro");

    await page.getByLabel(/número de documento/i).fill(`E2E-${sufijo}`);
    await page.getByLabel(/^nombres$/i).fill("Paciente");
    await page.getByLabel(/^apellidos$/i).fill("E2E Playwright");
    await page.getByLabel(/correo electrónico/i).fill(`paciente.e2e.${sufijo}@example.com`);
    await page.getByLabel(/^contraseña$/i).fill("clave123456");
    await page.getByRole("button", { name: "Crear cuenta" }).click();

    await expect(page).toHaveURL(/\/inicio/);
  });

  // El botón de cerrar sesión solo existe en el layout móvil (ver
  // app-shell.tsx: HojaPerfil tiene la clase lg:hidden) — no hay forma de
  // cerrar sesión desde el viewport de escritorio. Se documenta probando
  // el único camino que existe hoy, con un viewport móvil explícito.
  test("cerrar sesión (único camino disponible: menú de perfil en móvil) limpia la cookie", async ({ browser }) => {
    const context = await browser.newContext({ ...devices["iPhone 13"] });
    const page = await context.newPage();

    await page.goto("/login");
    await page.getByLabel(/correo electrónico/i).fill(PACIENTE.email);
    await page.getByLabel(/contraseña/i).fill(PACIENTE.password);
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await expect(page).toHaveURL(/\/inicio/);

    // "Perfil" a secas (botón de la barra inferior); hay otro botón
    // "Perfil de <nombre>" (el avatar del encabezado) que también calza con
    // una búsqueda parcial, así que se necesita el nombre exacto.
    await page.getByRole("button", { name: "Perfil", exact: true }).click();
    await page.getByRole("button", { name: /cerrar sesión/i }).click();

    await expect(page).toHaveURL(/\/login/);
    // Confirma que la ruta protegida vuelve a redirigir: la cookie ya no sirve.
    await page.goto("/turnos");
    await expect(page).toHaveURL(/\/login/);

    await context.close();
  });
});
