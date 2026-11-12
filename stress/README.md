# Pruebas de estrés — FilaCero Frontend (BFF)

Escenario de [Artillery](https://www.artillery.io/) contra el BFF del
frontend (`/api/auth/register` + `/api/bff/turnos`), no contra el backend
directo — mide lo que un usuario real siente (frontend + proxy + backend
juntos), mismo patrón que `stress/` en `filacero-backend`.

## Requisitos

1. El backend + Postgres deben estar arriba, con `npm run db:seed`
   corrido al menos una vez (el escenario toma el servicio/punto del
   catálogo público vía el propio BFF).
2. El frontend debe estar corriendo: `npm run dev` (puerto 3001).

## Correr

```bash
npm run test:stress
```

## Limpieza

Los usuarios que crea esta corrida usan el mismo prefijo `STRESS` en
`numeroDocumento` que el script de limpieza del backend, así que se
borran con el mismo comando, desde `filacero-backend`:

```bash
npm run stress:limpiar
```

No se duplicó el script de limpieza aquí porque el frontend no tiene base
de datos propia — todo lo que crea este escenario vive en la base del
backend.
