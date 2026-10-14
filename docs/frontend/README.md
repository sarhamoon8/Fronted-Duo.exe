# Documentación del frontend de FilaCero

Esta carpeta documenta en detalle **todo lo que hay en `Frontend/`**: cada capa, archivo y
componente, para quien necesite entender o modificar el proyecto sin tener que releer todo
el código fuente. El [README.md](../../README.md) de la raíz sigue siendo la referencia rápida
(puesta en marcha, variables de entorno, vistas por rol); aquí se profundiza en el cómo y el
porqué de cada pieza.

Stack: **Next.js 16 (App Router)** · React 19 · TypeScript 5 · Tailwind CSS 4 · Axios · Zustand ·
lucide-react · Inter (autoalojada). Backend de referencia: `Backend-Duo.exe` (NestJS + Prisma + JWT).

## Índice

1. [Arquitectura general](./01-arquitectura.md) — capas, flujo de dependencias, por qué está
   organizado así.
2. [Rutas y páginas](./02-rutas-y-paginas.md) — todo `app/`: layouts, páginas por rol, `proxy.ts`.
3. [Autenticación y sesión](./03-autenticacion-y-sesion.md) — JWT, cookie httpOnly, Route
   Handlers de `/api/auth/*` y el BFF `/api/bff/*`.
4. [Dominio y casos de uso](./04-dominio-y-aplicacion.md) — entidades, puertos, reglas de
   negocio y validaciones (`src/core/`).
5. [Infraestructura](./05-infraestructura.md) — repositorios HTTP, mappers, clientes Axios y el
   contenedor de dependencias (`src/infrastructure/`).
6. [Estado de cliente y hooks](./06-estado-y-hooks.md) — los 4 stores de Zustand y los hooks de
   `src/presentation/hooks/`.
7. [Componentes de presentación](./07-componentes.md) — layout, kit de UI y componentes de cada
   vista (auth, paciente, turnos, fila, admin).
8. [Estilos y accesibilidad](./08-estilos-y-accesibilidad.md) — tokens de Tailwind, paleta,
   convenciones de accesibilidad.
9. [Datos de ejemplo y pendientes](./09-datos-ejemplo-y-pendientes.md) — qué es real contra el
   backend, qué es mock, y los archivos en desuso.

## Convenciones del código (léelas antes de tocar algo)

- **Todo el código de dominio y presentación está en español** (nombres de archivos, funciones,
  variables, comentarios). Los tipos que reflejan un DTO del backend llevan un comentario
  `/** Espejo de XxxDto. */` apuntando a su origen.
- **Alias de import:** `@/*` apunta a `src/*` (ver [tsconfig.json](../../tsconfig.json)). Las
  rutas (`app/`) no están bajo el alias porque viven fuera de `src/`.
- **`"use client"`** se pone solo donde hace falta (hooks de React, Zustand, `document`/`window`).
  Las páginas de `app/(app)/*` que solo renderizan un componente cliente son Server Components.
- **`"server-only"`** protege `src/server/*` de terminar en un bundle de cliente por error
  (contienen la lógica que lee la cookie y habla con el backend con el JWT).
- Un archivo con el comentario `// Archivo en desuso: ... Puedes borrar este archivo sin
  problema.` es un remanente de la API externa de INVIMA (retirada) y solo existe para no romper
  imports; ver el capítulo 9.
