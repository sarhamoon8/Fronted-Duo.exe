# 9. Datos de ejemplo, funcionalidades pendientes y archivos en desuso

Este capítulo es el mapa de "qué es real contra el backend" vs. "qué es demo/placeholder", para
no confundir una cosa con otra al seguir desarrollando.

## `src/presentation/mocks/demo.ts`

Único archivo de datos de ejemplo del proyecto. Todo lo que se importe de aquí debe mostrarse en
la UI junto a un `<MarcaDemo />` (componente de `ui/card.tsx`, con `title` explicando el motivo).
Cuando el backend exponga estos recursos, el plan es reemplazar este archivo por un repositorio
real en `src/infrastructure/repositories/`, siguiendo el mismo patrón que los demás.

Exporta:

| Export | Usado en | Qué representa |
|---|---|---|
| `FORMULA_ACTIVA` | `MedicamentosPaciente` | Fórmula médica y sus medicamentos |
| `SEDES_FARMACIA` | `MedicamentosPaciente` | Cobertura de la fórmula por sede |
| `RESERVA_LISTA` | `DashboardPaciente` | Reserva de medicamentos lista para recoger |
| `PROXIMA_CITA` | (definido, sin uso actual en componentes) | Próxima cita médica |
| `INVENTARIO_CRITICO` | `ResumenOperativo`, `/admin/inventario` (`ListaInventario`) | Medicamentos con baja cobertura |
| `ESTADO_RED` | `ResumenOperativo` | Ventanillas activas / alertas / incidentes |

## Funcionalidades de la UI sin backend detrás (botones "decorativos")

Estos controles existen en el diseño de Figma pero **no ejecutan ninguna llamada**; están ahí
para que la interfaz se vea completa mientras el backend no soporte la operación:

- Pausar ventanilla / Cerrar turno / Transferir (`PanelFila`).
- Reservar medicamentos / Cambiar sede (`MedicamentosPaciente`).
- Exportar reporte (todas las páginas de `/admin`), Generar reporte (`/admin/reportes`).
- Agendar cita (`DashboardPaciente`, renderizado como `<button>` sin `href`).
- Cómo llegar (`MisTurnos`).
- Eliminar cuenta (`BotonEliminarCuenta`, en el menú de usuario y en la hoja de perfil móvil): el
  backend solo expone `GET`/`POST /usuarios`, no borrar el propio usuario.

## Contratos/supuestos a tener presentes al tocar la lógica de turnos

- **No existe "GET mis turnos" real para el paciente** en el flujo actual de UI: la posición se
  conoce únicamente por la respuesta de `POST /turnos` o `PATCH /cancelar`, y se persiste en
  `useTurnosStore` (localStorage). El caso de uso `MisTurnosUseCase` (que sí llama a
  `GET /turnos/mis-turnos`) existe en el dominio pero **no está conectado a ninguna pantalla** —
  candidato a usarlo si el backend garantiza que ese endpoint sea confiable como fuente de
  verdad.
- **Espera estimada del paciente**: supuesto de negocio `MINUTOS_POR_TURNO = 6` en
  `src/core/domain/entities/turno.ts`. No es un dato del backend.
- **Código de turno**: el backend sí emite `codigoAlfanumerico` (ej. `T-8K3PQ2`); el derivado del
  UUID (`codigoCorto`) es solo respaldo para datos antiguos o de ejemplo que no lo traigan.
- **Nombres de pacientes en la cola**: el personal (`FUNCIONARIO`) ve "Paciente XXXXXX" porque
  solo `ADMIN` puede listar usuarios (`GET /usuarios`). Si un `FUNCIONARIO` necesitara ver
  nombres reales, requeriría un cambio de permisos en el backend, no solo en el frontend.
- **Actualización de la cola**: cada 10 s (`INTERVALO_COLA_MS`); el resumen del admin, cada 30 s.
  El backend no tiene WebSockets ni Server-Sent Events.
- **Columna "Personal" en Servicios activos** (`ResumenOperativo`): siempre `"—"`, no hay dato de
  personal por servicio en el backend.
- **Atención promedio** (`PanelFila`): siempre `"—"`, se calculará cuando el backend registre
  tiempos de atención.

## Archivos en desuso — se pueden borrar sin romper nada

La integración con la API externa del **CUM de INVIMA** se retiró. Los siguientes archivos
quedaron con `export {}` únicamente para no romper imports existentes durante la transición, y
ya no los importa nadie:

- `src/infrastructure/http/external-client.ts`
- `src/infrastructure/repositories/medicamento.repository.ts`
- `src/core/application/use-cases/medicamentos.use-cases.ts`
- `src/core/domain/entities/medicamento.ts`
- `src/presentation/components/farmacia/buscador-medicamentos.tsx`

Antes de borrarlos, confirmar con `grep`/búsqueda de imports que efectivamente ya nadie los
referencia (al momento de escribir esta documentación, ninguno tenía importadores).

## Ruta legada

`app/(app)/farmacia/page.tsx` solo hace `redirect("/medicamentos")` — la sección de farmacia se
renombró a "Medicamentos"; se mantiene por compatibilidad con enlaces antiguos.
