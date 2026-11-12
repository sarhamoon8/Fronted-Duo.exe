/**
 * DATOS DE EJEMPLO para lo único del diseño que el backend todavía no
 * soporta: la reserva de medicamentos (no existe un endpoint para apartar
 * existencias a nombre de un paciente).
 *
 * Todo lo que se importe de aquí se marca en la interfaz con <MarcaDemo />.
 * Cuando el backend exponga reservas, reemplazar este archivo por un
 * repositorio real en src/infrastructure/repositories.
 */

export const RESERVA_LISTA = {
  medicamentos: "Losartán 50 mg y Acetaminofén 500 mg",
  recogerAntesDe: "Domingo, 27 sep · 4:30 p. m.",
  listos: "2 de 3",
  vigenciaHoras: 32,
};
