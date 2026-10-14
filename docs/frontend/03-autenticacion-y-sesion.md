# 3. Autenticación y sesión

## Resumen del flujo

```
Navegador ──cookie httpOnly──▶ Next.js /api/*  ──Authorization: Bearer──▶ NestJS
```

El backend firma un JWT y responde `{ accessToken }` sin más estado (no hay sesión en servidor,
ni logout real, ni refresh tokens). El frontend:

1. Envía credenciales a `/api/auth/login` o `/api/auth/register` (Route Handlers propios, no el
   BFF genérico, porque necesitan escribir la cookie).
2. El Route Handler llama al backend, recibe `accessToken`, arma la `Sesion` (a partir del
   payload del JWT + `GET /usuarios/:id` para el nombre completo) y la guarda en una cookie
   `httpOnly`.
3. Responde al navegador **solo** `{ sesion }` — el token nunca llega a JavaScript de cliente.
4. `SesionHydrator` vuelca esa `Sesion` en `useSesionStore` (Zustand) para que el resto de la UI
   la lea sin volver a pedirla.

## Archivos involucrados

| Archivo | Rol |
|---|---|
| `src/server/jwt.ts` | Decodifica el JWT (sin verificar firma) y helpers de expiración |
| `src/server/session.ts` | Lee/arma la cookie, construye la `Sesion`, todo en servidor |
| `src/server/backend-client.ts` | Cliente Axios de servidor hacia `API_URL` (nunca corre en el navegador) |
| `app/api/auth/_shared.ts` | `autenticarContraBackend()` compartido entre login y registro |
| `app/api/auth/login/route.ts` | `POST /api/auth/login` |
| `app/api/auth/register/route.ts` | `POST /api/auth/register` |
| `app/api/auth/logout/route.ts` | `POST /api/auth/logout` (solo borra la cookie) |
| `app/api/auth/session/route.ts` | `GET /api/auth/session` (sesión actual o 401) |
| `app/api/bff/[...path]/route.ts` | Proxy genérico autenticado para el resto de recursos |
| `proxy.ts` | Redirección optimista por cookie + rol antes de renderizar |
| `src/presentation/components/layout/sesion-hydrator.tsx` | Puente servidor → Zustand |
| `src/infrastructure/repositories/auth.repository.ts` | Repositorio de dominio que llama a `/api/auth/*` |

## `src/server/jwt.ts`

- `decodificarJwt(token)`: separa el JWT por `.`, decodifica base64url el payload y valida que
  tenga `sub`, `email` y un `rol` conocido (`ROLES`). **No verifica la firma** — no hace falta,
  porque el frontend nunca confía en el JWT para autorizar nada, solo lo usa para pintar UI y
  decidir a dónde redirigir. La verificación real ocurre en el backend en cada petición.
- `tokenExpirado(payload, margenSeg = 5)`: compara `exp` contra la hora actual con 5 s de margen.
- `sesionDesdePayload(payload, nombre?)`: arma el objeto `Sesion` de dominio.

## `src/server/session.ts` (marcado `"server-only"`)

- `opcionesCookie(maxAge)`: `httpOnly: true`, `secure` solo en producción, `sameSite: "lax"`,
  `path: "/"`.
- `maxAgeDesdeToken(token)`: calcula cuántos segundos le quedan al JWT para que la cookie expire
  exactamente cuando el token deje de ser válido.
- `leerToken()`: lee la cookie vía `next/headers`.
- `construirSesion(token)`: decodifica el JWT, valida que no esté vencido, y llama a
  `GET /usuarios/:id` en el backend para completar `nombres + apellidos`. Si el backend responde
  401, la sesión es `null` (token ya no sirve). Si el backend está caído (error de red), se
  degrada con gracia: arma la sesión solo con los claims del JWT, para no romper la UI por una
  caída puntual del backend.
- `obtenerSesionServidor()`: azúcar para Server Components/layouts — lee el token y construye la
  sesión en un solo paso.

## Route Handlers de `/api/auth/*`

- **`_shared.ts` → `autenticarContraBackend(ruta, request)`**: cuerpo compartido de login y
  registro.
  1. Parsea el body como JSON (400 si falla).
  2. `POST {API_URL}{ruta}` con `crearBackendClient()` (sin token).
  3. Si el backend no respondió 2xx o no trae `accessToken`, reenvía el status/cuerpo del
     backend tal cual (o 502 si el status no es de error).
  4. Construye la sesión con `construirSesion(token)`; si falla (token inválido), 502.
  5. Responde `{ sesion }` con `status 200` y setea la cookie con
     `maxAgeDesdeToken(token)`.
- **`logout/route.ts`**: el backend no tiene endpoint de logout (JWT sin estado) — cerrar sesión
  es simplemente expirar la cookie (`maxAge: 0`) y responder 204.
- **`session/route.ts`**: `GET` — si no hay cookie o el token es inválido/vencido, responde 401 y
  de paso limpia la cookie; si es válido, responde `{ sesion }`.

## BFF genérico: `app/api/bff/[...path]/route.ts`

Proxy hacia `{API_URL}/*` para todo lo que no sea `/auth`:

- **Recursos permitidos** (whitelist por regex):
  `entidades-medicas`, `servicios`, `puntos-dispensacion`, `ventanillas`, `turnos`, `usuarios`.
  Cualquier otra ruta responde 404 antes de tocar el backend.
- **CSRF básico**: en métodos con cuerpo (`POST/PUT/PATCH/DELETE`) valida que el header `Origin`
  (si viene) coincida con el origen de la petición; si no, 403.
- Lee el JWT de la cookie (`leerToken()`) y lo reenvía como `Authorization: Bearer` — si no hay
  cookie, la petición sale sin `Authorization` y el backend decide (401 si el endpoint la exige).
- Reenvía método, query string y cuerpo **sin transformarlos** (`transformResponse: (d) => d`),
  de modo que el frontend ve exactamente el mismo contrato que se ve por Postman contra el
  backend, incluidos los cuerpos de error 400/401/403/404/409 de NestJS.
- Si el backend responde 401, además de reenviarlo borra la cookie (el token ya no sirve).
- `Cache-Control: no-store` siempre, para que Next/el navegador no cacheen respuestas de la API.

## `internal-client.ts` — cliente Axios del navegador

`src/infrastructure/http/internal-client.ts` expone `internalApi`, con `baseURL: "/api"` y
`withCredentials: true` (para que la cookie viaje incluso si algún día front y BFF quedan en
orígenes distintos). Su interceptor de respuesta:

- Normaliza cualquier error de Axios a `AppError` (`normalizarError`).
- Si la respuesta es 401 **y la ruta no es de `/auth/*`** (evita bucles durante login), invoca un
  callback registrado con `registrarManejadorSesionExpirada(fn)`. Ese callback lo registra
  `SesionHydrator` al montar el layout protegido: limpia `useSesionStore`, redirige a
  `/login?expirada=1` y refresca. Así, cualquier 401 inesperado durante la navegación (p. ej. el
  backend invalidó el token) saca al usuario de forma consistente sin que cada componente tenga
  que manejarlo.

## Redirecciones seguras

`LoginForm` usa `destinoSeguro(valor)` para el parámetro `?siguiente=`: solo acepta rutas que
empiecen por `/` y no por `//`, evitando *open redirects* hacia otro dominio.
