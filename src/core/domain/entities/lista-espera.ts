/** Espejo de ListaEsperaResponseDto (GET /lista-espera/mis-inscripciones). */
export interface InscripcionEspera {
  id: string;
  usuarioId: string;
  servicioId: string;
  puntoId: string;
  creadoEn: Date;
  /** Calculada por el backend: inscripciones más antiguas del mismo servicio y sede, más una. */
  posicion: number;
}
