# 1. Arquitectura general

## Vista de capas

El frontend sigue una arquitectura limpia simplificada (dominio → aplicación → infraestructura →
presentación), adaptada a Next.js App Router:

```
app/                          ← Capa de entrega: rutas, layouts, Route Handlers
  (auth)/                     ← Páginas públicas (login, registro)
  (app)/                      ← Páginas protegidas (una por rol/sección)
  api/auth/*                  ← Route Handlers: login, register, logout, session
  api/bff/[...path]           ← BFF genérico hacia el backend NestJS

proxy.ts                      ← Protección de rutas por cookie + rol (antes "middleware")

src/
  config/env.ts                ← Variables de entorno tipadas (solo servidor)
  core/
    domain/                    ← Entidades, enums, errores y PUERTOS (interfaces). Sin imports
                                  de framework, sin Axios, sin Next.
    application/use-cases/     ← Casos de uso: orquestan un puerto + validan igual que los DTO
                                  del backend (NestJS ValidationPipe).
  infrastructure/
    http/                      ← Clientes Axios (interno) y normalización de errores
    repositories/               ← Implementan los puertos del dominio hablando con /api/*
    mappers/                    ← DTO (JSON/HTTP) → entidad de dominio (fechas, enums)
    container.ts                ← Composición raíz: une casos de uso + repositorios concretos
  server/                       ← Código EXCLUSIVO de servidor: JWT, cookie, cliente al backend
  presentation/
    components/                 ← UI, organizada por feature
    hooks/                      ← Hooks de datos y de UI
    stores/                     ← Estado global (Zustand)
    lib/cn.ts                   ← Utilidades puras (fechas, clases CSS)
    mocks/demo.ts                ← Datos de ejemplo para secciones que el backend no soporta aún
```

## Por qué estas capas

- **`core/domain`** no sabe que existe Axios, Next.js ni el navegador. Solo define qué es un
  `Turno`, qué estados puede tener y qué operaciones existen (`ports/index.ts`). Esto permite
  testear reglas de negocio (p. ej. `puedeAvanzar`, `estimarEspera`) sin levantar nada.
- **`core/application/use-cases`** depende solo de los puertos (`AuthRepository`,
  `TurnoRepository`, etc.), nunca de la implementación HTTP. Cada caso de uso es una clase con
  un único método `ejecutar(...)` y valida entradas con las mismas reglas que los DTO del
  backend (`class-validator`), para que el usuario nunca dependa de un 400 del servidor para
  saber que un campo es obligatorio.
- **`infrastructure`** es la única capa que sabe que el transporte es HTTP/Axios contra `/api/*`.
  Si mañana se cambiara de NestJS a otro backend, o de REST a otra cosa, solo esta carpeta
  cambiaría.
- **`infrastructure/container.ts`** es la composición raíz del lado del cliente: es el único
  lugar donde se hace `new HttpTurnoRepository()` y se inyecta en `new SolicitarTurnoUseCase(...)`.
  El resto de la app importa `casosDeUso` desde ahí y nunca instancia nada directamente.
- **`server/`** existe porque hay lógica que *nunca* debe llegar al navegador: decodificar y
  usar el JWT, leer la cookie httpOnly y hablar con el backend real (`API_URL`). Está marcada con
  `import "server-only"` para que un import accidental desde un componente cliente rompa el build.
- **`presentation`** es la única capa que conoce React. Los componentes llaman a `casosDeUso.*`
  (nunca a un repositorio ni a Axios directamente) y leen/escriben estado en los stores de
  Zustand.

## Flujo de una petición típica (paciente pide un turno)

```
SolicitarTurno (componente)
  → casosDeUso.solicitarTurno.ejecutar(servicioId, puntoId)     [core/application]
  → SolicitarTurnoUseCase valida servicioId/puntoId, llama al puerto
  → HttpTurnoRepository.solicitar(...)                          [infrastructure]
  → internalApi.post("/bff/turnos", { servicioId, puntoId })    [infrastructure/http]
  → Next.js Route Handler app/api/bff/[...path]/route.ts
  → lee la cookie httpOnly, arma Authorization: Bearer <jwt>
  → axios → backend NestJS POST /turnos
  ← respuesta (mismo status/cuerpo) reenviada tal cual al navegador
  ← TurnoMapper.toDomain(dto) convierte fechas string → Date
  ← useTurnosStore.guardar(turno, contexto) persiste en localStorage (por no existir
     "GET mis turnos" en el backend)
```

Este patrón (componente → caso de uso → repositorio → `internalApi` → BFF → backend) se repite
para **todas** las operaciones autenticadas. Las únicas excepciones son login/registro/logout/
sesión, que usan Route Handlers propios en `app/api/auth/*` porque necesitan leer/escribir la
cookie (ver [capítulo 3](./03-autenticacion-y-sesion.md)).

## Por qué el navegador nunca ve el JWT

```
Navegador ──cookie httpOnly──▶ Next.js /api/*  ──Authorization: Bearer──▶ NestJS
```

- El backend firma un JWT y responde `{ accessToken }`. Los Route Handlers de `/api/auth/*` lo
  guardan en una cookie `httpOnly; SameSite=Lax` (`Secure` en producción) y devuelven al
  navegador solo la `Sesion` (id, nombre, email, rol, expiración), nunca el token.
- Ningún JavaScript de cliente puede leer esa cookie. El cliente Axios interno
  (`internalApi`, `withCredentials: true`) simplemente la deja viajar sola.
- El BFF (`app/api/bff/[...path]/route.ts`) y los Route Handlers de auth son los únicos puntos
  que leen la cookie (`leerToken()`) y la convierten en `Authorization: Bearer` para el backend.
- La autorización real (qué puede hacer cada rol) la sigue validando el backend
  (`JwtAuthGuard` + `RolesGuard`). `proxy.ts` solo hace una redirección "optimista" en el
  cliente para no mostrar pantallas que el backend rechazaría.

## Decisiones que vale la pena recordar

- **No hay Redux ni React Query**: el estado remoto se pide con `useEffect` + `useState` dentro
  de hooks a medida (`useCatalogo`, `useCola`, `useResumenOperativo`); el estado que debe
  sobrevivir a un refresh vive en Zustand con `persist`.
- **No hay WebSockets**: la cola de atención se refresca cada 10 s
  (`INTERVALO_COLA_MS` en `use-cola.ts`) y el resumen del admin cada 30 s
  (`use-resumen-operativo.ts`), y solo si la pestaña está visible
  (`document.visibilityState === "visible"`).
- **El paciente no tiene "GET mis turnos"** en el backend: sus turnos se guardan localmente en
  `useTurnosStore` (localStorage) cada vez que el backend responde a un `POST /turnos` o
  `PATCH /cancelar`. Es la única fuente de "mis turnos" en la UI.
