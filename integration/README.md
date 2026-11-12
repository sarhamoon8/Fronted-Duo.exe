# Pruebas de integración del BFF

Llaman por HTTP real a los Route Handlers (`app/api/auth/*`, `app/api/bff/*`)
corriendo en `http://localhost:3001`, contra el backend real en
`http://localhost:3000` — sin mocks en ninguna de las dos puntas.

## Requisitos

1. Backend + Postgres arriba (`npm run start:dev` en `filacero-backend`, o
   `docker compose up`), con `npm run db:seed` corrido al menos una vez.
2. Frontend corriendo: `npm run dev` (puerto 3001).

## Correr

```bash
npm run test:integration
```

## Por qué no se puede probar esto llamando directo a `route.ts`

Los Route Handlers usan `cookies()` de `next/headers`, que depende del
`AsyncLocalStorage` que Next.js arma por cada request real del servidor.
Invocar `POST(request)` directamente en un test (sin servidor real)
lanza porque ese contexto no existe. De ahí que, a diferencia de las
unitarias (que sí mockean `next/headers`), esta capa necesite el servidor
real arriba — el mismo principio que las pruebas de integración del
backend contra Postgres real en vez de un repositorio falso.
