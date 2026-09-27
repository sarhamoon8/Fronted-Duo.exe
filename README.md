# FilaCero — Frontend

Frontend de **FilaCero** (turnos virtuales y seguimiento de la dispensación de medicamentos).
Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Axios · Zustand · lucide-react · Inter.

El diseño sigue el archivo de Figma **FilaCero · Frontend simplificado** (escritorio y móvil).

Se adapta **sin modificaciones** al backend [Backend-Duo.exe](https://github.com/sarhamoon8/Backend-Duo.exe)
(NestJS + Prisma + JWT).

## Puesta en marcha

```bash
# 1. Backend (en su repo): npm install, docker compose up -d, npx prisma migrate dev, npm run start:dev  → :3000
# 2. Frontend
npm install
cp .env.example .env.local   # ajusta API_URL si el backend no está en :3000
npm run dev                  # → http://localhost:3001
```

**Primer administrador.** El registro público siempre crea `PACIENTE` y `POST /usuarios` exige `ADMIN`,
así que el primer admin se promueve a mano una sola vez: regístrate en la app y cambia tu `rol` a `ADMIN`
con `npx prisma studio` (en el backend). Desde ahí, el panel **Administración** crea entidades,
servicios y funcionarios.

## Variables de entorno

| Variable | Dónde se usa | Descripción |
|---|---|---|
| `API_URL` | Solo servidor | URL del backend NestJS (por defecto `http://localhost:3000`). |
| `AUTH_COOKIE_NAME` | Solo servidor | Nombre de la cookie httpOnly del JWT (`filacero_token`). |

## Arquitectura

```
app/                        Rutas (capa de entrega)
  (auth)/login, registro    Páginas públicas
  (app)/inicio, turnos,     Páginas protegidas (layout valida la sesión e hidrata Zustand)
        fila, farmacia, admin
  api/auth/*                Route Handlers: login, register, logout, session (gestionan la cookie)
  api/bff/[...path]         BFF: proxy hacia el backend añadiendo Authorization: Bearer
proxy.ts                    Protección de rutas por cookie y rol (antes "middleware")
src/
  config/env.ts             Variables de entorno tipadas
  core/domain/              Entidades, reglas y puertos (sin dependencias de frameworks)
  core/application/         Casos de uso (validaciones espejo de los DTO del backend)
  infrastructure/http/      Cliente Axios hacia /api (BFF de Next.js → backend)
  infrastructure/           Mappers DTO↔dominio, repositorios y contenedor de dependencias
  server/                   Código solo-servidor: cliente Axios al backend, sesión, JWT
  presentation/             Componentes, hooks y stores de Zustand
```

### Flujo del JWT (cookie httpOnly)

```
Navegador ──cookie httpOnly──▶ Next.js /api/*  ──Authorization: Bearer──▶ NestJS
```

El backend devuelve `{ accessToken }` y solo lee la cabecera `Authorization`. El frontend guarda
el token en una cookie `httpOnly; SameSite=Lax` (y `Secure` en producción) que JavaScript no puede
leer, y el BFF la traduce a `Bearer` en cada petición. El BFF reenvía status y cuerpo originales
del backend (mismos errores que ves en Postman), limita los recursos permitidos y rechaza
mutaciones de otro origen.

### Estado global (Zustand)

- `sesion.store` — usuario autenticado (hidratado desde el servidor, nunca persiste el token).
- `turnos.store` — turnos del paciente (persistidos por usuario en `localStorage`).
- `fila.store` — entidad/servicio elegidos en el puesto de atención (`sessionStorage`).

## Vistas por rol

Cada rol entra directo a su portada (`proxy.ts` redirige según el `rol` del JWT).

| Rol | Rutas | Qué funciona contra el backend |
|---|---|---|
| **Paciente** | `/inicio`, `/turnos`, `/turnos/solicitar`, `/medicamentos`, `/historial` | Solicitar turno en 3 pasos (`GET /entidades-medicas`, `GET /servicios`, `POST /turnos`), seguimiento, cancelar (`PATCH /turnos/:id/cancelar`) |
| **Personal de atención** | `/fila`, `/fila/atendidos`, `/fila/historial` | Cola del servicio (`GET /turnos/servicio/:id`), llamar al siguiente y marcar atendido (`PATCH …/avanzar`), no se presentó / cancelar (`PATCH …/cancelar`) |
| **Administrador** | `/admin`, `/admin/servicios`, `/admin/inventario`, `/admin/reportes` | Indicadores calculados con los turnos reales, demanda por hora, espera por servicio, crear sedes, servicios y usuarios (`POST /entidades-medicas`, `/servicios`, `/usuarios`) |

**Datos de ejemplo.** Lo que el backend todavía no tiene (fórmulas, reservas e inventario de medicamentos, citas,
ventanillas, estado de la red) sale de `src/presentation/mocks/demo.ts` y se marca en pantalla con la etiqueta
"Datos de ejemplo". Algunos botones del diseño aún no hacen nada (Pausar ventanilla, Cerrar turno, Transferir,
Reservar medicamentos, Exportar reporte, Cómo llegar, Agendar cita).

**Contratos a tener en cuenta**

- El backend no tiene un endpoint para que el paciente consulte sus turnos: la posición se muestra con
  la respuesta de `POST /turnos` o `PATCH /cancelar`, y se guarda localmente.
- La espera estimada del paciente usa el supuesto `MINUTOS_POR_TURNO = 6` (`src/core/domain/entities/turno.ts`).
- El backend no emite un código alfanumérico: la interfaz muestra `T-XXXXXX`, tomado del UUID.
- El personal de atención ve "Paciente XXXXXX" porque solo `ADMIN` puede listar usuarios (`GET /usuarios`).
- La cola se actualiza sola cada 10 s y el resumen del admin cada 30 s (el backend no tiene WebSockets).

## Paleta y accesibilidad

60 % `#F3F4F6` (fondos, tablas) · 30 % cerceta (`#0D9488` y sus tonos oscuros `#115E59`/`#0F766E` para la barra
lateral y botones) · 10 % esmeralda `#10B981` (acciones, estados de farmacia). Los tokens viven en `app/globals.css`.
El blanco sobre `#10B981` (como en los mockups) tiene contraste 2.5:1, por debajo de WCAG AA; si lo necesitas AA,
cambia `text-white` por `text-tinta` en la variante `primario` de `src/presentation/components/ui/button.tsx`. Incluye enlace para saltar al contenido, foco visible, `aria-live` en resultados,
tablas con `caption`, objetivos táctiles de 44 px y `prefers-reduced-motion`.

## Postman

En `postman/` hay una colección y un entorno:

1. **Backend NestJS (Bearer)**: contrato original; el login guarda `{{token}}`.
2. **Frontend BFF (cookie)**: mismas operaciones a través de `:3001/api/*`; verifica que la cookie sea httpOnly y que el token no se exponga.

## Scripts

`npm run dev` · `npm run build` · `npm start` · `npm run lint` · `npm run typecheck`

## Archivos en desuso (se pueden borrar)

La API externa del INVIMA se retiró por ahora. Estos archivos quedaron vacíos (`export {}`) para no romper
la compilación y se pueden eliminar sin problema:

- `src/infrastructure/http/external-client.ts`
- `src/infrastructure/repositories/medicamento.repository.ts`
- `src/core/application/use-cases/medicamentos.use-cases.ts`
- `src/core/domain/entities/medicamento.ts`
- `src/presentation/components/farmacia/buscador-medicamentos.tsx`
