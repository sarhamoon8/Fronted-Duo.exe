# 6. Estado de cliente y hooks (`src/presentation/{stores,hooks}/`)

No hay Redux ni React Query. El estado remoto se resuelve con hooks a medida (`useEffect` +
`useState`); el estado que debe sobrevivir a un refresh o compartirse entre componentes vive en
Zustand.

## Los 4 stores de Zustand

### `stores/sesion.store.ts` — `useSesionStore`
```ts
{ usuario: Sesion | null; estado: "desconocido" | "autenticado" | "anonimo";
  establecer(usuario); limpiar(); }
```
**No persiste nada** (ni `localStorage` ni `sessionStorage`): la fuente de verdad es la cookie
httpOnly. `SesionHydrator` (en el layout protegido) lo hidrata en cada carga con la sesión que
resolvió el servidor. `limpiar()` se llama al cerrar sesión o cuando `internalApi` recibe un 401
inesperado.

### `stores/turnos.store.ts` — `useTurnosStore` (persistido en `localStorage`, clave `filacero-turnos`)
El backend **no expone un "GET mis turnos"** para el paciente: el turno y su posición solo llegan
en la respuesta de `POST /turnos` y `PATCH /cancelar`. Por eso el frontend guarda localmente,
por `usuarioId`, cada turno solicitado (`TurnoGuardado`: incluye `servicioNombre` y
`entidadNombre` porque el backend tampoco los expande, solo IDs).

- `guardar(turno, { servicioNombre, entidadNombre })`: inserta al frente de la lista del usuario
  (dedupe por `id`).
- `actualizar(turno)`: refresca `estado`/`posicion`/`actualizadoEn` de un turno ya guardado (tras
  cancelar, por ejemplo).
- `quitar(usuarioId, turnoId)`: usado desde "Historial" para limpiar turnos ya `ATENDIDO`/`CANCELADO`.
- Helpers de módulo: `useMisTurnos(usuarioId)` (selector memoizado con un array `VACIO` estable
  para no re-renderizar de más) y `turnoActivoDe(turnos)` (primer `PENDIENTE`/`EN_CURSO`).

**Importante:** esto es estado *por dispositivo/navegador*, no por cuenta. Si el paciente entra
desde otro navegador, no verá turnos que pidió desde este.

### `stores/fila.store.ts` — `useFilaStore` (persistido en `sessionStorage`, clave `filacero-fila`)
Preferencias del puesto de atención del personal (`entidadId`, `puntoId`, `servicioId`,
`ventanillaId`, `autoActualizar`). Al cambiar de entidad se limpian punto/servicio/ventanilla en
cascada (`setEntidad` resetea los tres); al cambiar de punto se limpia solo la ventanilla. Vive
en `sessionStorage` porque es una preferencia de la pestaña/turno de trabajo, no algo que deba
sobrevivir entre sesiones distintas del mismo dispositivo.

### `stores/ui.store.ts` — `useUiStore`
Solo `{ perfilAbierto: boolean; abrirPerfil(); cerrarPerfil(); }` — controla la hoja de perfil
inferior en móvil (`AppShell`). Sin persistencia.

## Hooks

### `hooks/use-montado.ts` — `useMontado()`
`useSyncExternalStore` que devuelve `false` en el primer render (SSR/hidratación) y `true` una
vez montado en cliente. Se usa antes de leer stores persistidos en `localStorage`/
`sessionStorage` (p. ej. `useMisTurnos`) para evitar mismatches de hidratación entre servidor y
cliente.

### `hooks/use-ahora.ts` — `useAhora(ms = 15_000)`
Timestamp que se refresca cada `ms` milisegundos, para recalcular "hace X min" o tiempos de
espera sin depender de que llegue un dato nuevo del servidor.

### `hooks/use-catalogo.ts` — `useCatalogo(entidadId)`
Carga `entidades` una vez y, cuando hay `entidadId`, sus `servicios` y `puntos`. Usa un patrón de
"clave vigente" (`Cargado<T> { clave, datos, error }`) para evitar condiciones de carrera: cada
efecto solo aplica su resultado si su `clave` (compuesta de `entidadId` + un contador `version`)
sigue siendo la vigente cuando la promesa resuelve. `recargar()` incrementa `version` para forzar
una nueva carga de entidades. Devuelve también los flags `cargandoEntidades/Servicios/Puntos` y
un único `error` (el primero que exista).

### `hooks/use-cola.ts` — `useCola()`
El hook más grande: agrupa todo el estado que necesita la vista del personal de atención.

- Envuelve `useCatalogo(entidadId)` + el estado de puesto de `useFilaStore`.
- Carga `ventanillas` del punto elegido.
- Si el rol es `ADMIN`, precarga `nombres` (mapa `usuarioId → "Nombres Apellidos"`) llamando a
  `casosDeUso.listarUsuarios`, porque solo `ADMIN` puede listar usuarios — el `FUNCIONARIO` verá
  "Paciente XXXXXX" (ver `nombrePaciente()`).
- `recargar()` pide `ConsultarFilaUseCase.ejecutar(puntoId, servicioId)` y guarda el resultado
  junto con la combinación `{ puntoId, servicioId }` con la que se pidió, para poder comprobar
  que sigue siendo la combinación vigente (`coincide`) antes de mostrarlo — evita pintar datos de
  un punto/servicio que el usuario ya cambió mientras la petición estaba en vuelo.
- **Auto-actualización**: `setInterval` cada `INTERVALO_COLA_MS` (10 s), solo si
  `autoActualizar` está activo y `document.visibilityState === "visible"` (no gasta peticiones
  con la pestaña en segundo plano). El backend no tiene WebSockets/SSE, así que este polling es
  el mecanismo de "tiempo real".
- Devuelve un objeto grande (`ColaState`, tipo exportado) que consumen `PanelFila`,
  `SelectorPuesto` y `TablaTurnosServicio`.

### `hooks/use-resumen-operativo.ts`
- `calcularResumen(entidades, servicios, turnosPorServicio, ahora)`: función pura (fácil de
  testear) que agrega, a partir de los turnos crudos, indicadores para el panel de
  administración: `emitidosHoy`, `atendidosHoy`, `esperaPromedio`, `nivelServicio`
  (`atendidos / emitidos * 100`), `demandaPorHora` (franja 7 a. m.–6 p. m., zona `America/Bogota`)
  y `porServicio` (agrupado por **nombre** de servicio, porque el mismo servicio puede existir en
  varias sedes con IDs distintos).
- `useResumenOperativo()`: pide `listarEntidades` + `listarServicios`, y por cada servicio
  `consultarFila(servicio.id)` en paralelo (`Promise.all`), y llama a `calcularResumen`. Se
  refresca cada 30 s con la misma guarda de `visibilityState`.
- `META_ESPERA_MIN = 30`: umbral usado tanto aquí como en `PanelFila` para marcar "alta demanda".

### `presentation/lib/cn.ts` — utilidades puras (no es un hook, pero vive junto a ellos)
- `cn(...clases)`: concatenador de clases condicionales, sin dependencias externas (no es
  `clsx`/`tailwind-merge`).
- Fechas/horas, todas fijadas a `America/Bogota` vía `Intl`: `formatearFechaHora`,
  `formatearHora`, `fechaLarga` ("Viernes, 25 de septiembre"), `fechaCorta`, `horaBogota`,
  `saludo` (buenos días/tardes/noches), `esHoy`, `minutosDesde`, `haceCuanto` ("hace 3 min").
- `enmascararEmail("maria.perez@correo.co")` → `"m•••••@correo.co"` (se usa al mostrar a quién se
  le notifica, sin exponer el correo completo en pantalla).
