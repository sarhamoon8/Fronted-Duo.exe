# 5. Infraestructura (`src/infrastructure/`)

Es la única capa que sabe que el transporte es HTTP/Axios contra `/api/*` (nunca contra el
backend directo: eso solo lo hace `src/server/`, del lado servidor).

## `http/internal-client.ts` — cliente Axios del navegador

Ver también el [capítulo 3](./03-autenticacion-y-sesion.md#internal-clientts--cliente-axios-del-navegador).

- `internalApi = axios.create({ baseURL: "/api", withCredentials: true, timeout: 15_000, ... })`.
- Interceptor de respuesta: normaliza errores a `AppError` y dispara el manejador de "sesión
  expirada" registrado por `SesionHydrator` cuando un 401 no viene de `/auth/*`.
- `registrarManejadorSesionExpirada(fn)`: único punto de acoplamiento entre infraestructura y
  presentación (un callback, no un import cruzado de capas).

## `http/normalizar-error.ts`

`normalizarError(error, origen)` traduce cualquier error de Axios a `AppError`, entendiendo el
formato de error de NestJS + `ValidationPipe` (`{ message: string | string[], error, statusCode }`):

- Si `error.response` no existe (no hubo respuesta del servidor): `AppError([...], 0, "red")`,
  con mensaje distinto si fue timeout (`ECONNABORTED`) o sin conexión.
- Si `body.message` es un array (típico de `ValidationPipe` con varios campos inválidos), se usan
  tal cual.
- Si es un string, se usa ese string.
- Si no hay `message`, cae a `MENSAJE_POR_STATUS[status]` (mapa de mensajes genéricos en español
  para 400/401/403/404/409/502) o `"Error {status}."`.

## `http/external-client.ts`

Archivo vacío en desuso (integración con el CUM de INVIMA, retirada). Ver capítulo 9.

## `mappers/index.ts` — DTO → dominio

Define los DTO tal como llegan por HTTP (fechas como `string` ISO) y los mappers que los
convierten a las entidades de dominio (fechas como `Date`, `rol`/`estado` tipados):

- `UsuarioDto` → `UsuarioMapper.toDomain`.
- `TurnoDto` → `TurnoMapper.toDomain` (convierte `horaLlamado`, `horaFinalizacion`, `creadoEn`).
- `EntidadMedicaDto`, `ServicioDto`, `PuntoDispensacionDto`, `VentanillaDto` son alias directos de
  las entidades de dominio (no requieren conversión: no tienen fechas).

## `repositories/` — implementaciones concretas de los puertos

Cada repositorio implementa una interfaz de `core/domain/ports` y solo habla con `internalApi`
(nunca con `axios` directo ni con el backend):

| Repositorio | Puerto | Endpoints (a través del BFF salvo auth) |
|---|---|---|
| `auth.repository.ts` (`HttpAuthRepository`) | `AuthRepository` | `/api/auth/login`, `/register`, `/logout`, `/session` |
| `catalogo.repository.ts` (`HttpCatalogoRepository`) | `CatalogoRepository` | `/bff/entidades-medicas`, `/bff/servicios`, `/bff/puntos-dispensacion` |
| `turno.repository.ts` (`HttpTurnoRepository`) | `TurnoRepository` | `/bff/turnos`, `/bff/turnos/:id/cancelar`, `/bff/turnos/:id/avanzar`, `/bff/turnos/mis-turnos` |
| `usuario.repository.ts` (`HttpUsuarioRepository`) | `UsuarioRepository` | `/bff/usuarios` (solo `ADMIN`) |
| `ventanilla.repository.ts` (`HttpVentanillaRepository`) | `VentanillaRepository` | `/bff/ventanillas?puntoId=` |
| `medicamento.repository.ts` | — | vacío, en desuso (INVIMA) |

Notas puntuales:

- `HttpTurnoRepository.avanzar(turnoId, ventanillaId?)`: solo manda `{ ventanillaId }` en el
  cuerpo si viene definido (necesario al llamar un `PENDIENTE`; no aplica al finalizar un
  `EN_CURSO`).
- `HttpTurnoRepository.listarPorPunto(puntoId, servicioId?)`: `servicioId` es opcional — sin él
  trae todos los servicios del punto.
- `HttpAuthRepository.obtenerSesion()`: si el 401 viene como `AppError`, devuelve `null` en vez
  de propagar el error (401 en `/session` es un caso esperado: "no hay sesión", no una falla).

## `container.ts` — composición raíz

```ts
"use client";
const authRepo = new HttpAuthRepository();
const turnoRepo = new HttpTurnoRepository();
// ...

export const casosDeUso = {
  iniciarSesion: new IniciarSesionUseCase(authRepo),
  solicitarTurno: new SolicitarTurnoUseCase(turnoRepo),
  // ...
} as const;
```

Es el **único** lugar donde se decide qué implementación concreta satisface cada puerto del
dominio. Toda la capa de presentación importa `casosDeUso` desde aquí — nunca instancia un
repositorio ni un caso de uso por su cuenta. Si se necesitara mockear la capa de datos (tests,
Storybook, etc.), este es el archivo a sustituir.

`"use client"` en la cabecera es intencional: los casos de uso terminan usándose desde
componentes cliente (formularios, hooks), así que el árbol de instancias vive en el bundle de
cliente.
