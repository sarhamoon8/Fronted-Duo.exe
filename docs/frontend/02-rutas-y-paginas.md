# 2. Rutas y páginas (`app/`)

Next.js 16 App Router con dos grupos de rutas: `(auth)` (público) y `(app)` (protegido), más los
Route Handlers de `/api`. `proxy.ts` (antes "middleware") filtra por cookie y rol antes de que
cualquier página se renderice.

## Árbol completo

```
app/
  layout.tsx                     Root layout: fuente Inter, <html lang="es-CO">, metadata global
  page.tsx                       Landing pública ("/"); redirige si ya hay sesión
  not-found.tsx                  404 genérico
  globals.css                    Tokens de Tailwind + animaciones de la portada

  (auth)/
    layout.tsx                   Panel lateral cerceta (desktop) / cabecera compacta (móvil)
    login/page.tsx               → <LoginForm />
    registro/page.tsx            → <RegistroForm />

  (app)/
    layout.tsx                   Resuelve la sesión en servidor, redirige si no hay, monta <AppShell>
    inicio/page.tsx              Dashboard del PACIENTE (redirige a otros roles a su inicio)
    turnos/page.tsx              "Mi turno" → <MisTurnos />
    turnos/solicitar/page.tsx    Flujo de 3 pasos → <SolicitarTurno />
    medicamentos/page.tsx        → <MedicamentosPaciente /> (datos de ejemplo)
    historial/page.tsx           → <HistorialPaciente />
    farmacia/page.tsx            Redirect 308 a /medicamentos (ruta antigua)

    fila/page.tsx                Cola de atención del FUNCIONARIO/ADMIN → <PanelFila />
    fila/atendidos/page.tsx      → <TablaTurnosServicio estados=[ATENDIDO, CANCELADO]>
    fila/historial/page.tsx      → <TablaTurnosServicio estados=[todos]>

    admin/page.tsx               Resumen operativo → <ResumenOperativo />
    admin/servicios/page.tsx     Alta de sedes/servicios/usuarios → <PanelAdmin />
    admin/inventario/page.tsx    Inventario (datos de ejemplo) → <ListaInventario />
    admin/reportes/page.tsx      Tarjetas de reportes (sin backend aún, solo UI)

  api/
    auth/
      _shared.ts                 autenticarContraBackend() y errorSinBackend(), compartidos
      login/route.ts             POST → backend /auth/login + cookie
      register/route.ts          POST → backend /auth/register + cookie
      logout/route.ts            POST → borra la cookie (JWT sin estado, no hay endpoint)
      session/route.ts           GET  → sesión actual (o 401) sin exponer el token
    bff/[...path]/route.ts       Proxy genérico autenticado hacia el backend (GET/POST/PUT/PATCH/DELETE)
```

## `proxy.ts` — protección de rutas

Sustituye al antiguo `middleware.ts`. Es **optimista**: solo mira si hay una cookie con un JWT
no expirado y qué `rol` trae, para poder redirigir sin hacer una petición de red. La autorización
real la sigue validando el backend (`JwtAuthGuard` + `RolesGuard`) en cada endpoint.

Reglas (`RUTAS_POR_ROL`):

| Prefijo | Roles permitidos |
|---|---|
| `/admin` | `ADMIN` |
| `/fila` | `FUNCIONARIO`, `ADMIN` |
| `/turnos`, `/medicamentos`, `/historial`, `/farmacia`, `/inicio` | todos |

Comportamiento:

- Sin sesión y ruta protegida → redirige a `/login?siguiente=<ruta>` (y si había una cookie con
  un token vencido, se le añade `?expirada=1` y se borra la cookie).
- Con sesión pero rol sin permiso → redirige a `INICIO_POR_ROL[rol]?sinPermiso=1`.
- Con sesión y visitando `/login` o `/registro` → redirige directo a su portada
  (`INICIO_POR_ROL`).
- `/inicio` es solo para `PACIENTE`; si un `FUNCIONARIO`/`ADMIN` navega ahí, se le redirige a la
  suya (`/fila` o `/admin`).
- `INICIO_POR_ROL`: `PACIENTE → /inicio`, `FUNCIONARIO → /fila`, `ADMIN → /admin` (debe
  coincidir siempre con la copia en
  `src/presentation/components/layout/navegacion.ts`).

El `matcher` de `proxy.ts` limita en qué rutas corre (todas las anteriores + `/login`,
`/registro`), para no ejecutarse en assets estáticos ni en `/api/*`.

## Layout protegido (`app/(app)/layout.tsx`)

1. Llama a `obtenerSesionServidor()` (Server Component): lee la cookie, decodifica el JWT y
   confirma contra el backend con `GET /usuarios/:id` (para traer nombre completo).
2. Si no hay sesión válida → `redirect("/login?expirada=1")` (defensa en profundidad además de
   `proxy.ts`).
3. Renderiza `<AppShell sesion={sesion}>` (barra lateral/inferior + cabecera) y
   `<SesionHydrator sesion={sesion} />`, que vuelca esa sesión al store de Zustand
   `useSesionStore` en el cliente.

## Páginas destacadas

- **`app/page.tsx`** (landing): Server Component; si hay JWT vigente redirige directo al inicio
  del rol. Si no, muestra `<Presentacion />` (pantalla de bienvenida animada, una sola vez por
  sesión de navegador) más el hero con accesos a login/registro.
- **`app/(app)/inicio/page.tsx`**: lee `searchParams.sinPermiso` para mostrar una alerta si
  `proxy.ts` redirigió aquí por falta de permisos.
- **`app/(app)/farmacia/page.tsx`**: ruta legada que solo hace `redirect("/medicamentos")`
  (código 308), para no romper enlaces antiguos.
- **`app/(app)/fila/atendidos` y `.../historial`**: ambas reusan `<TablaTurnosServicio>` con
  distinto filtro de `estados`; toda la lógica de selección de puesto vive en el hook
  `useCola()` compartido.

## Metadata

Cada `page.tsx` exporta `export const metadata: Metadata = { title: "…" }`; el `template` del
root layout (`"%s · FilaCero"`) arma el título final (p. ej. "Mi turno · FilaCero").
