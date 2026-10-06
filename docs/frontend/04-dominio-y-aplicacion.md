# 4. Dominio y casos de uso (`src/core/`)

Esta capa no importa Axios, Next.js ni nada de React. Es TypeScript puro: entidades, enums,
errores, puertos (interfaces) y casos de uso. Todo lo que aquí se valida **espeja** las reglas
del backend (DTO + `class-validator`) para dar feedback inmediato sin depender de un 400.

## `core/domain/entities/`

### `rol.ts`
- `ROLES = ["PACIENTE", "FUNCIONARIO", "ADMIN"]` — espejo exacto del enum `Rol` de Prisma.
- `ROL_ETIQUETA`: etiquetas en español para la UI.
- `ROLES_STAFF` / `esStaff(rol)`: agrupa `FUNCIONARIO` y `ADMIN`.

### `sesion.ts`
- `JwtPayload`: `sub`, `email`, `rol`, `iat?`, `exp?` — forma exacta del payload que firma el
  backend.
- `Sesion`: lo que consume la interfaz (`id`, `nombre`, `email`, `rol`, `expiraEn` en epoch ms).

### `turno.ts` (la entidad más rica del dominio)
- `ESTADOS_TURNO = ["PENDIENTE", "EN_CURSO", "ATENDIDO", "CANCELADO"]`.
- `Turno`: espejo de `TurnoResponseDto` (fechas ya como `Date`, no `string`; eso lo hace el
  mapper de infraestructura).
- `SIGUIENTE_ESTADO` — máquina de estados replicada de `AvanzarTurnoUseCase` del **backend**:
  `PENDIENTE → EN_CURSO → ATENDIDO`; `CANCELADO` no tiene siguiente. Sirve únicamente para no
  mostrar botones que el backend rechazaría con 400; el backend sigue siendo la fuente de verdad.
- `puedeAvanzar(estado)` / `puedeCancelar(estado)` / `estaActivo(estado)`: guardas derivadas de
  esa máquina de estados.
- `codigoCorto(id)` / `codigoTurno(t)`: el backend ya genera un código alfanumérico propio
  (`codigoAlfanumerico`, ej. `T-8K3PQ2`); `codigoTurno` lo prefiere siempre que exista, y solo
  cae a un derivado del UUID (`codigoCorto`) como respaldo para datos antiguos o de ejemplo.
- `MINUTOS_POR_TURNO = 6` y `estimarEspera(posicion)`: supuesto de negocio explícito para
  estimar la espera mientras el backend no registre tiempos reales de atención. **Si el backend
  llega a exponer tiempos reales, este es el punto a reemplazar.**

### `usuario.ts`
`Usuario`, `NuevoUsuario` (espejo de `CrearUsuarioDto`, solo `ADMIN`), `DatosRegistro` (espejo de
`RegisterDto`, siempre crea `PACIENTE`), `Credenciales` (espejo de `LoginDto`).

### `catalogo.ts`
`EntidadMedica` (sede/EPS), `Servicio`, `PuntoDispensacion` (la sede física de una entidad,
con dirección/ciudad/capacidad) y `Ventanilla` (el módulo desde donde el personal llama turnos;
`estadoOperativo: "ACTIVA" | "INACTIVA"`).

### `medicamento.ts`
Archivo vacío en desuso (ver capítulo 9): la integración con el CUM de INVIMA se retiró.

## `core/domain/errors.ts`

- `AppError extends Error`: `mensajes: string[]`, `status: number`,
  `origen: "interna" | "red"`. Getters `noAutorizado` (401) y `prohibido` (403). Todo repositorio
  HTTP traduce cualquier fallo a esta clase (ver `normalizarError` en infraestructura) para que
  la presentación nunca dependa de Axios.
- `mensajeDeError(error)`: extrae un mensaje humano de cualquier `unknown` (usado en los
  `catch` de hooks y formularios).

## `core/domain/ports/index.ts` — los contratos

```ts
AuthRepository       // iniciarSesion, registrarse, cerrarSesion, obtenerSesion
CatalogoRepository   // entidades, servicios, puntos (listar + crear entidad/servicio)
VentanillaRepository // listarPorPunto
TurnoRepository      // solicitar, cancelar, avanzar, listarPorPunto, misTurnos
UsuarioRepository    // listar, crear (solo ADMIN)
```

La capa de aplicación programa contra estas interfaces; `src/infrastructure/repositories/*` las
implementa con Axios. Esto es lo que permite, en teoría, sustituir el transporte sin tocar una
sola regla de negocio.

## `core/application/use-cases/`

Cada caso de uso es una clase pequeña: recibe el repositorio por el constructor y expone
`ejecutar(...)`. Ninguno cachea ni mantiene estado propio.

### `auth.use-cases.ts`
- `validarCredenciales(c)`: email con regex simple + password no vacío (mismas reglas que
  `LoginDto`: `IsEmail`, `IsString`).
- `validarRegistro(d)`: documento/tipo/nombres/apellidos no vacíos, email válido, password ≥ 6
  caracteres (mismas reglas que `RegisterDto`).
- `IniciarSesionUseCase`, `RegistrarseUseCase`, `CerrarSesionUseCase`: validan y normalizan
  (`trim()`, `email.toLowerCase()`) antes de llamar al `AuthRepository`. Si hay errores de
  validación, lanzan `AppError(errores, 400)` **sin llegar a golpear la red**.

### `catalogo.use-cases.ts`
`ListarEntidadesUseCase`, `ListarServiciosUseCase`, `ListarPuntosUseCase`,
`CrearEntidadUseCase`, `CrearServicioUseCase` (validan nombre/entidadId no vacíos),
`ListarUsuariosUseCase`, `CrearUsuarioUseCase` (reutiliza `validarRegistro` porque
`CrearUsuarioDto` tiene las mismas reglas que `RegisterDto` + un `rol` opcional).

### `turnos.use-cases.ts`
- `SolicitarTurnoUseCase`: exige `servicioId` y `puntoId`.
- `CancelarTurnoUseCase`: usa `puedeCancelar(estado)` — rechaza en cliente cancelar un turno ya
  `ATENDIDO`/`CANCELADO` antes de llamar al backend.
- `AvanzarTurnoUseCase`: usa `puedeAvanzar(estado)`; además exige `ventanillaId` **solo** cuando
  el turno está `PENDIENTE` (llamar exige decir desde qué ventanilla; finalizar uno `EN_CURSO`
  no).
- `ConsultarFilaUseCase` → `ResumenFila`: pide `listarPorPunto(puntoId, servicioId?)` y calcula
  en el cliente el `conteo` por estado y cuál es el `siguiente` turno `PENDIENTE` (el backend ya
  devuelve la lista ordenada por `creadoEn` ascendente, así que "el primero pendiente" es
  correcto).
- `MisTurnosUseCase`: llama a `GET /turnos/mis-turnos` (existe para el caso de uso interno, pero
  la UI de paciente usa el store local — ver capítulo 6 — porque el backend no tenía este
  endpoint cuando se hizo el frontend; revisar si ya se puede migrar).

### `ventanillas.use-cases.ts`
`ListarVentanillasUseCase`: lista las ventanillas de un punto de dispensación.

### `medicamentos.use-cases.ts`
Archivo vacío en desuso (INVIMA).

## Cómo se relacionan estas reglas con la UI

Los formularios y paneles (`LoginForm`, `RegistroForm`, `SolicitarTurno`, `PanelAdmin`,
`PanelFila`, `MisTurnos`) siempre:

1. Llaman a `casosDeUso.<algo>.ejecutar(...)`.
2. Si el caso de uso lanza `AppError`, se muestran `error.mensajes` en un `<ListaErrores>`.
3. Si lanza cualquier otra cosa (red caída, etc.), se usa `mensajeDeError(err)`.

Esto es constante en todo el proyecto — ver los mismos tres pasos repetidos en cada
`try { await casosDeUso... } catch (e) { ... }`.
