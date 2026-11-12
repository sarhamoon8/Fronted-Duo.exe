import { test, expect, type Page } from "@playwright/test";

const PACIENTE = { email: "paciente@filacero.demo", password: "FilaCero2026!" };

/**
 * Las opciones de sede/punto/servicio son radios visualmente ocultos
 * (sr-only) dentro de un <label>: el indicador decorativo que se ve queda
 * encima en la pila de apilamiento e intercepta el click si se apunta al
 * radio directamente. Clicar el texto visible del label es lo que haría
 * un usuario real y dispara el radio por la semántica nativa de <label>.
 */
async function elegirOpcion(page: Page, texto: string) {
  await page.getByText(texto, { exact: true }).click();
  await expect(page.getByRole("radio", { name: new RegExp(texto) })).toBeChecked();
}

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel(/correo electrónico/i).fill(PACIENTE.email);
  await page.getByLabel(/contraseña/i).fill(PACIENTE.password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL(/\/inicio/);
}

test.describe("Solicitar un turno (e2e, stack completo)", () => {
  test.afterEach(async ({ page }) => {
    // Deja la cuenta de demo limpia para la siguiente corrida: si quedó un
    // turno activo (el flujo de "éxito" lo crea a propósito), se cancela.
    await page.goto("/turnos");
    // El botón "Cancelar turno" se renderiza dos veces (versión escritorio
    // y versión móvil, una de cada una oculta por CSS según el viewport);
    // ambas llaman al mismo handler, así que basta con la primera —
    // .first() evita que isVisible()/click() fallen por "strict mode"
    // (2 coincidencias).
    const cancelar = page.getByRole("button", { name: /cancelar turno/i }).first();
    // isVisible() es una revisión instantánea, sin espera: justo después de
    // goto() la página puede seguir en su propio spinner de carga inicial
    // (useMisTurnos todavía no resolvió), así que un isVisible() de un solo
    // intento puede dar "false" aunque el turno sí exista, saltándose la
    // limpieza en silencio. waitFor() sí espera (con límite) a que aparezca.
    const hayTurnoActivo = await cancelar
      .waitFor({ state: "visible", timeout: 5000 })
      .then(() => true)
      .catch(() => false);
    if (hayTurnoActivo) {
      page.once("dialog", (dialog) => dialog.accept());
      // No basta con esperar a que el botón quede oculto: durante la
      // recarga post-cancelación la pantalla completa pasa por un spinner
      // ("Cargando tu turno…") que también lo oculta momentáneamente, así
      // que esa aserción pasaría en falso aunque la cancelación real
      // hubiera fallado. Se espera la respuesta real del backend (vía el
      // proxy BFF) para confirmar que de verdad se canceló.
      const [respuesta] = await Promise.all([
        page.waitForResponse(
          (res) => /\/api\/bff\/turnos\/.+\/cancelar$/.test(res.url()) && res.request().method() === "PATCH",
        ),
        cancelar.click(),
      ]);
      expect(respuesta.status()).toBe(200);
    }
  });

  test("flujo completo: seleccionar sede/punto/servicio, confirmar y ver el turno asignado", async ({ page }) => {
    await login(page);

    await page.goto("/turnos/solicitar");

    await elegirOpcion(page, "Nueva EPS");
    await elegirOpcion(page, "Sede Fusagasugá");
    await elegirOpcion(page, "Dispensación general de medicamentos");

    await page.getByRole("button", { name: "Continuar" }).click(); // paso 0 -> 1 (datos)
    await page.getByRole("button", { name: "Continuar" }).click(); // paso 1 -> 2 (confirmar)
    await page.getByRole("button", { name: "Confirmar turno" }).click();

    await expect(page).toHaveURL(/\/turnos\?nuevo=1/);
    await expect(page.getByText("¡Turno asignado!")).toBeVisible();
    // El código real lo genera el backend (T-XXXXXX); confirma el formato,
    // no un valor fijo (es aleatorio en cada corrida). Aparece dos veces en
    // la página (la tarjeta grande y el texto del aviso de "asignado").
    await expect(page.getByText(/T-[A-Z0-9]{6}/).first()).toBeVisible();
    await expect(page.getByText("En espera").first()).toBeVisible();
  });

  test("el botón Continuar permanece deshabilitado hasta elegir sede, punto y servicio", async ({ page }) => {
    await login(page);
    await page.goto("/turnos/solicitar");

    const continuar = page.getByRole("button", { name: "Continuar" });
    await expect(continuar).toBeDisabled();

    await elegirOpcion(page, "Nueva EPS");
    await expect(continuar).toBeDisabled(); // falta punto y servicio

    await elegirOpcion(page, "Sede Fusagasugá");
    await expect(continuar).toBeDisabled(); // falta servicio

    await elegirOpcion(page, "Dispensación general de medicamentos");
    await expect(continuar).toBeEnabled();
  });
});
