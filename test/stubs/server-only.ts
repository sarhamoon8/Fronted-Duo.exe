// Stub para pruebas: el paquete real "server-only" lanza un error al
// importarse fuera de un bundle de servidor de Next.js (su mecanismo
// depende del bundler, no de Node). Vitest corre en Node plano, así que se
// resuelve a este módulo vacío vía el alias en vitest.config.ts.
export {};
