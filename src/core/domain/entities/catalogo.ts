/** Espejo de EntidadMedicaResponseDto. */
export interface EntidadMedica {
  id: string;
  nombre: string;
}

/** Espejo de ServicioResponseDto. */
export interface Servicio {
  id: string;
  nombre: string;
  entidadId: string;
}
