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

/** Espejo de PuntoDispensacionResponseDto — la sede física de una entidad. */
export interface PuntoDispensacion {
  id: string;
  entidadId: string;
  nombreSede: string;
  direccion: string;
  ciudad: string;
  telefonoContacto: string | null;
  capacidadAtencion: number;
}

/** Espejo de VentanillaResponseDto — el módulo desde donde llama el personal. */
export interface Ventanilla {
  id: string;
  puntoId: string;
  numeroModulo: string;
  estadoOperativo: "ACTIVA" | "INACTIVA";
}
