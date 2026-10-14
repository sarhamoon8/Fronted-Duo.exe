# 7. Componentes de presentación (`src/presentation/components/`)

```
components/
  layout/     Estructura de la app (shell, navegación, cabecera, portada)
  ui/         Kit de UI genérico y sin conocimiento de negocio
  auth/       Formularios de login y registro
  paciente/   Dashboard, historial y medicamentos del paciente
  turnos/     Solicitar turno (wizard) y seguimiento ("Mi turno")
  fila/       Vistas del personal de atención (cola, atendidos, historial)
  admin/      Panel de administración y resumen operativo
  farmacia/   Vacío, en desuso (ver capítulo 9)
```

## `layout/`

### `navegacion.ts`
Fuente única de verdad del menú por rol (`NAVEGACION: Record<Rol, ItemNavegacion[]>`), de la
página de inicio por rol (`INICIO_POR_ROL` — **debe coincidir** con la copia en `proxy.ts`) y de
las etiquetas de perfil (`PERFIL_ETIQUETA`). `estaActivo(item, pathname)` decide el resaltado
activo (exacto o por prefijo, según `item.exacto`). Cada `ItemNavegacion` puede marcar
`soloEscritorio: true` para no aparecer en la barra inferior móvil (se accede desde la hoja de
perfil) y `corta` para una etiqueta más breve en esa barra.

### `app-shell.tsx` — `<AppShell>`
Estructura raíz de la zona autenticada, fiel al Figma:

- **Escritorio (`lg+`)**: grid `244px | 1fr`; barra lateral fija (`BarraLateral`) en cerceta
  oscuro con logo, perfil activo, navegación y bloque de ayuda.
- **Móvil**: `NavegacionInferior` fija (barra de pestañas + botón "Perfil" que abre `HojaPerfil`,
  un diálogo modal inferior con datos del usuario, accesos "solo escritorio", ayuda, cerrar
  sesión y "Eliminar cuenta").
- Incluye un enlace "Saltar al contenido" (accesibilidad) que apunta a `#contenido` (definido en
  `<Pagina>`).
- Cierra la hoja de perfil automáticamente al cambiar de ruta (`useEffect` sobre `pathname`).
- `cerrarSesion`/`salir`: llama a `casosDeUso.cerrarSesion.ejecutar()`, limpia
  `useSesionStore`, `router.replace("/login")` y `router.refresh()` (para que el Server Component
  del layout vuelva a evaluar que ya no hay sesión).

### `pagina.tsx` — `<Pagina>`, `<BarraSuperior>`, `iniciales()`
Envoltorio de cada vista de la zona autenticada:

- Publica el `antetitulo` en un Context (`AntetituloContext`) que `<EncabezadoPagina>` (en
  `ui/card.tsx`) puede leer en móvil, donde no hay barra superior con título.
- `CabeceraMovil`: cabecera cerceta con logo compacto + iniciales del usuario (botón que abre el
  perfil).
- `BarraSuperior` (solo escritorio): antetítulo, título, descripción, píldora opcional
  "En servicio" (`enServicio`), botón de notificaciones y `<MenuUsuario>` (dropdown con
  nombre/email, cerrar sesión y "Eliminar cuenta").
- `BotonEliminarCuenta`: **sin acción real** — el backend no expone un endpoint para que el
  usuario borre su propia cuenta.

### `logo.tsx` — `<Logo compacto? />`
Ícono `TicketCheck` en caja blanca + "FilaCero" (+ lema "Salud sin filas" en la versión no
compacta).

### `sesion-hydrator.tsx` — `<SesionHydrator sesion>`
Puente servidor → Zustand: vuelca la `Sesion` resuelta en el layout protegido a
`useSesionStore` (con `useLayoutEffect` en cliente para hacerlo antes del primer paint visible) y
registra el manejador de sesión expirada de `internalApi` (ver capítulo 3). No renderiza nada.

### `presentacion.tsx` — `<Presentacion>`
Pantalla de bienvenida animada de la landing (`app/page.tsx`), una sola vez por carga de la app
(flag de módulo `yaMostrada`, no persistido). Fases `visible → saliendo → oculta`; se puede saltar
con clic, `Escape`/`Enter` o el botón "Saltar". Respeta `prefers-reduced-motion` (recorta la
duración visible a 1.5 s). Bloquea el scroll del `body` mientras está visible.

## `ui/` — kit de UI genérico

Sin lógica de negocio; todo el resto de componentes se construye sobre este kit.

- **`button.tsx`**: `claseBoton(variante, tamaño, extra)` genera las clases; `<Button>`
  (con `cargando` → spinner + `aria-busy`) y `<BotonEnlace>` (mismo look, pero `<Link>`).
  Variantes: `primario` (esmeralda, 10 % del diseño — CTA principal), `estructura` (cerceta,
  30 %), `secundario` (borde cerceta), `peligro` (rojo), `fantasma` (transparente).
- **`card.tsx`**: `<Card>` (contenedor base), `<CardTitulo>` (título + descripción + acciones de
  una tarjeta), `<EncabezadoPagina>` (título grande de la página, lee `AntetituloContext` para
  móvil), `<Indicador>` (tarjeta de KPI con icono de color), `<Pildora>` (badge de estado, 6
  tonos), `<MarcaDemo>` (etiqueta "Datos de ejemplo" con `title` explicando por qué).
- **`field.tsx`**: `<Input>` y `<Select>`, ambos con `etiqueta`/`ayuda`/`error` y
  `aria-describedby` calculado automáticamente; comparten el mismo contenedor `<Envoltura>`.
- **`alert.tsx`**: `<Alert tono="info|exito|aviso|error">` (con icono y `role="alert"` solo en
  error) y `<ListaErrores errores={string[]}>` (usada tras cada `catch` de un caso de uso).
- **`badge.tsx`**: `<BadgeEstadoTurno estado>` — mapea cada `EstadoTurno` a un tono/ícono de
  `<Pildora>` reutilizando `ESTADO_TURNO_ETIQUETA` del dominio.
- **`empty-state.tsx`**: `<EstadoVacio titulo icono?>` — bloque con borde punteado para listas
  vacías.
- **`spinner.tsx`**: `<Spinner etiqueta?>` — SVG animado; si trae `etiqueta`, la envuelve en
  `role="status"`.

## `auth/`

- **`login-form.tsx`**: valida con `validarCredenciales` (dominio), llama a
  `casosDeUso.iniciarSesion.ejecutar`, actualiza `useSesionStore` y redirige a
  `destinoSeguro(params.get("siguiente"))`. Muestra un aviso si llegó `?expirada=1`.
- **`registro-form.tsx`**: valida con `validarRegistro`, siempre crea `PACIENTE`
  (`casosDeUso.registrarse`), redirige a `/inicio`.

## `paciente/`

- **`dashboard-paciente.tsx`**: portada del paciente (`/inicio`). Muestra `<TurnoEnCurso>` (si
  hay un turno `PENDIENTE`/`EN_CURSO` en `useTurnosStore`) o `<SinTurno>`; una tarjeta
  `<ReservaLista>` de **datos de ejemplo** (`RESERVA_LISTA`); accesos rápidos a historial,
  medicamentos y "Agendar cita" (este último sin `href`: el backend no gestiona citas, se
  renderiza como `<button>` inerte). Exporta `<BarraProgreso>` y `cercania(posicion)`
  (`100/posición`, usados también por `mis-turnos.tsx`).
- **`historial-paciente.tsx`**: tabla de `useMisTurnos(usuario.id)` (todo el historial local);
  permite "Quitar" del historial los turnos ya `ATENDIDO`/`CANCELADO` (`useTurnosStore.quitar`,
  solo borra el registro local, no llama al backend).
- **`medicamentos-paciente.tsx`**: **100 % datos de ejemplo** (`FORMULA_ACTIVA`,
  `SEDES_FARMACIA` de `mocks/demo.ts`) — el backend no tiene fórmulas/inventario/reservas. Permite
  marcar qué medicamentos incluir en la reserva y elegir sede (checkboxes/radios), pero el botón
  "Reservar medicamentos" y "Cambiar sede" no ejecutan ninguna llamada.

## `turnos/`

- **`solicitar-turno.tsx`** (`<SolicitarTurno>`): wizard de 3 pasos (sede+punto+servicio → datos
  → confirmación), con `<Pasos>` como indicador de progreso. Usa `useCatalogo(entidadId)` para
  las listas dependientes. Al confirmar, llama `casosDeUso.solicitarTurno.ejecutar(servicioId,
  puntoId)` y guarda el resultado en `useTurnosStore` con el nombre de servicio/entidad (que el
  backend no expande). El documento de identidad capturado en el paso 2 **no se envía al
  backend** — es solo para que el paciente lo tenga a mano en la ventanilla. `iconoServicio(nombre)`
  elige un ícono heurísticamente según palabras clave del nombre del servicio (el backend solo
  guarda texto libre, no una categoría).
- **`mis-turnos.tsx`** (`<MisTurnos>`): pantalla de seguimiento del turno activo (o
  `<EstadoVacio>` si no hay ninguno). Calcula posición, personas antes, espera estimada y
  porcentaje de cercanía (reusa `<BarraProgreso>`/`cercania` de `paciente/dashboard-paciente.tsx`).
  Permite cancelar (`casosDeUso.cancelarTurno`, con `window.confirm`) si `puedeCancelar(estado)`.
  Si llega `?nuevo=1` (tras solicitar), muestra un aviso de éxito con el código.

## `fila/` — personal de atención (`FUNCIONARIO`/`ADMIN`)

- **`selector-puesto.tsx`** (`<SelectorPuesto cola>`): 4 `<Select>` encadenados (sede → punto →
  servicio opcional → ventanilla), deshabilitados según lo que falte por elegir; consume el
  `ColaState` de `useCola()`.
- **`panel-fila.tsx`** (`<PanelFila>`): la vista "Cola de atención" (`/fila`). Indicadores (en
  espera, atendidos hoy, espera promedio, atención promedio — este último aún `"—"` porque no hay
  tiempos de atención reales), tarjeta "Atendiendo ahora" (con acciones marcar atendido / no se
  presentó / transferir — esta última sin acción), tarjeta "Siguiente en fila" (llamar), aviso de
  atención prioritaria, y la tabla `<ColaActual>` con menú de acciones por fila (llamar/cancelar).
  Todas las mutaciones pasan por `casosDeUso.avanzarTurno`/`cancelarTurno` y recargan la cola al
  terminar. Los botones "Pausar ventanilla" y "Cerrar turno" del encabezado no tienen acción (el
  backend no soporta pausar ventanillas ni cerrar turno de trabajo).
- **`tabla-turnos-servicio.tsx`** (`<TablaTurnosServicio titulo descripcion estados>`): tabla
  genérica reusada por `/fila/atendidos` (`ATENDIDO`+`CANCELADO`) y `/fila/historial` (todos los
  estados), filtrando y revirtiendo (`.reverse()`) la lista de `useCola().fila.turnos`.

## `admin/`

- **`panel-admin.tsx`** (`<PanelAdmin>`, en `/admin/servicios`): tres formularios independientes
  (nueva entidad, nuevo servicio, nuevo usuario), cada uno con su propio `useMutacion()` (hook
  interno del archivo: `enviando/errores/exito` + `correr(fn)`). Tras cada alta exitosa, recarga
  `entidades + servicios + usuarios` en paralelo. Debajo, dos tablas de solo lectura: servicios
  agrupados por entidad, y el listado completo de usuarios.
- **`resumen-operativo.tsx`** (`<ResumenOperativo>`, en `/admin`): consume
  `useResumenOperativo()`. Indicadores reales (turnos emitidos/atendidos, espera promedio, nivel
  de servicio), `<GraficoDemanda>` por hora, espera por servicio (barras), tabla de "Servicios
  activos" (con columna "Personal" aún `"—"`, sin dato en el backend). Las secciones "Inventario
  crítico" (`<ListaInventario>`, también usada en `/admin/inventario`) y "Estado de la red" usan
  `mocks/demo.ts` y llevan `<MarcaDemo>`.
- **`grafico-demanda.tsx`** (`<GraficoDemanda datos>`): gráfico de barras verticales hecho a mano
  (sin librería de charts), con tooltip por hover, hora pico resaltada en esmeralda, y una tabla
  `sr-only` equivalente para lectores de pantalla.

## `farmacia/`
`buscador-medicamentos.tsx` está vacío (`export {}`), remanente de la integración con el CUM de
INVIMA. Ver capítulo 9.
