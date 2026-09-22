# FilaCero — Frontend

Frontend del proyecto integrador FilaCero: sistema web para la gestión de turnos y el seguimiento de la dispensación de medicamentos en EPS y centros médicos (Ingeniería de Software I, Universidad de Cundinamarca — Fusagasugá).

Equipo: Sarha Luna Gómez Valenzuela y Ashly Mariana Gómez Rivera.

Backend del proyecto (repositorio aparte, no se modifica desde acá): [Backend-Duo.exe](https://github.com/sarhamoon8/Backend-Duo.exe).

## Stack

- React + Next.js (App Router) + TypeScript
- Tailwind CSS

## Arquitectura

Arquitectura hexagonal por módulo, igual que el backend. Cada módulo en `src/modules/<modulo>/` sigue:

```
domain/          → entidades, interfaces de repositorio (puertos)
application/     → casos de uso
infrastructure/  → adaptador HTTP (consume la API) y vistas/componentes React
```

`app/` (rutas de Next.js) es solo una capa delgada de ruteo: cada `page.tsx` importa y renderiza la vista real que vive dentro de `modules/`.

Cada módulo (`auth`, `catalogo`, `turnos`) tiene su propia URL base de API configurable por variable de entorno, todas apuntando hoy al mismo backend monolítico — así una futura separación en microservicios no requiere tocar el dominio ni los casos de uso, solo configuración.

## Ramas

- `produccion` — rama base, estable.
- `preproduccion` — cambios integrados antes de pasar a producción.
- `desarrollo` — trabajo activo de las funcionalidades.

Flujo: `desarrollo` → merge a `preproduccion` → merge a `produccion`.

## Estado

En construcción — scaffold de Next.js y las funcionalidades (autenticación, catálogo de servicios, gestión de turnos) están planificadas y se implementan sobre la rama `desarrollo`.
