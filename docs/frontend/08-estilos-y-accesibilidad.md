# 8. Estilos y accesibilidad

## Tailwind CSS 4 y tokens de diseño

No hay `tailwind.config.js` clásico: Tailwind 4 se configura con `@theme` directamente en
`app/globals.css`, y `postcss.config.mjs` solo activa `@tailwindcss/postcss`. Todos los colores,
la fuente y la sombra de tarjeta se definen ahí como variables `--color-*` / `--font-*` /
`--shadow-*`, y Tailwind genera las utilidades (`bg-cerceta`, `text-tinta-tenue`,
`shadow-tarjeta`, …) automáticamente a partir de esos nombres.

### Paleta (regla 60/30/10 del diseño en Figma)

| Uso | Color | Token |
|---|---|---|
| 60 % — fondos, tablas, superficies | `#F3F4F6` / blanco | `neutro`, `neutro-2`, `superficie` |
| 30 % — estructura (barra lateral, botones "estructura") | `#0D9488` y oscuros `#115E59`/`#0F766E` | `cerceta`, `cerceta-profundo`, `cerceta-oscuro`, `cerceta-noche` |
| 10 % — acción principal / farmacia | `#10B981` | `esmeralda`, `esmeralda-profundo` |
| Apoyo | ámbar, azul, rojo | `ambar*`, `azul*`, `rojo*`, `peligro` |

La fuente es **Inter Variable** autoalojada (`@fontsource-variable/inter`, importada en
`app/layout.tsx`), no Google Fonts por CDN.

### Advertencia de contraste ya documentada en el código

El texto blanco sobre `#10B981` (botón `primario`, como en los mockups) da un contraste de
**2.5:1**, por debajo de WCAG AA. Si se necesita cumplir AA, cambiar `text-white` por
`text-tinta` en la variante `primario` de `src/presentation/components/ui/button.tsx`. Esta es
una decisión de diseño consciente documentada en el `README.md` raíz, no un descuido.

## Animaciones de la portada

`app/globals.css` define keyframes propios (`intro-aparecer`, `intro-logo`, `intro-punto`,
`intro-halo`, `intro-salida`) usados por `<Presentacion>` y sus clases `.intro-*`. Un bloque
`@media (prefers-reduced-motion: reduce)` global reduce **todas** las animaciones/transiciones
del sitio a 0.01 ms, no solo las de la portada.

## Accesibilidad: patrones que se repiten en toda la app

- **Salto al contenido**: `<AppShell>` incluye un enlace `sr-only` a `#contenido`, y `<Pagina>`
  pone `id="contenido" tabIndex={-1}` en el `<main>`.
- **Foco visible**: `:focus-visible { outline: 3px solid var(--color-cerceta-noche); }` global en
  `globals.css` (no se depende de los estilos por defecto del navegador).
- **`aria-live`**: las zonas de error/éxito tras una mutación (`<ListaErrores>`, avisos de
  `<PanelFila>`, `<SolicitarTurno>`, `<MisTurnos>`) están envueltas en `aria-live="polite"` para
  que un lector de pantalla anuncie el resultado sin que el usuario tenga que navegar hasta ahí.
- **Tablas**: todas llevan `<caption className="sr-only">` describiendo su contenido y
  `scope="col"` en los `<th>` (turnos, usuarios, inventario, cobertura por sede).
- **Objetivos táctiles de 44 px**: botones y controles usan alturas mínimas (`min-h-11`,
  `min-h-12`, `size-10`/`size-11`) acordes a WCAG 2.5.5.
- **Formularios**: `<Input>`/`<Select>` calculan `aria-describedby` combinando ayuda + error, y
  marcan `aria-invalid` cuando hay error.
- **Diálogos**: la hoja de perfil móvil (`HojaPerfil`) usa `role="dialog"` +
  `aria-modal="true"` + cierre con `Escape`; los menús desplegables (`MenuUsuario`,
  `MenuAcciones` en la tabla de la cola) usan `role="menu"`/`menuitem`, `aria-haspopup`,
  `aria-expanded` y cierran al hacer clic fuera o con `Escape`.
- **Iconografía decorativa**: los iconos de `lucide-react` que no aportan información adicional
  llevan `aria-hidden="true"`; los que sí la aportan (p. ej. el punto de "1 notificación nueva")
  se anuncian por texto en el `aria-label` del botón contenedor.
- **`prefers-reduced-motion`**: respetado tanto globalmente (`globals.css`) como puntualmente en
  `<Presentacion>` (acorta su duración en vez de solo quitar la animación, para no dejar la
  pantalla de bienvenida bloqueando la navegación más tiempo del necesario).

## Convención de nombres de clases con `cn()`

`src/presentation/lib/cn.ts` exporta un `cn(...)` minimalista (sin `clsx`/`tailwind-merge`): solo
filtra valores falsy y une con espacio. Se usa en casi todos los componentes para alternar clases
según estado (`activo`, `marcado`, `esPico`, etc.). No deduplica clases conflictivas de Tailwind,
así que al añadir variantes nuevas hay que evitar pasar dos veces la misma utilidad con valores
distintos.
