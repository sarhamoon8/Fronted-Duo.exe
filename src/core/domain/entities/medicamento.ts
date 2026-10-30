/** Espejo de MedicamentoResponseDto (GET /medicamentos). */
export interface Medicamento {
  id: string;
  codigoNacional: string;
  nombreGenerico: string;
  concentracion: string;
  presentacion: string;
  laboratorioFabricante: string;
  requiereAutorizacion: boolean;
}

/** Espejo de InventarioResponseDto (GET /inventario?puntoId=). */
export interface ExistenciaMedicamento {
  id: string;
  puntoId: string;
  medicamentoId: string;
  lote: string;
  stockActual: number;
  stockReservado: number;
  cantidadDisponible: number;
  disponible: boolean;
  fechaVencimiento: Date;
}

export type NivelDisponibilidad = "DISPONIBLE" | "BAJA" | "AGOTADO";

/** Por debajo de este número de unidades se considera "baja disponibilidad". */
export const UMBRAL_BAJA_DISPONIBILIDAD = 100;

export function nivelDisponibilidad(cantidad: number): NivelDisponibilidad {
  if (cantidad <= 0) return "AGOTADO";
  if (cantidad < UMBRAL_BAJA_DISPONIBILIDAD) return "BAJA";
  return "DISPONIBLE";
}

export const NIVEL_ETIQUETA: Record<NivelDisponibilidad, string> = {
  DISPONIBLE: "Disponible",
  BAJA: "Baja disponibilidad",
  AGOTADO: "Agotado",
};
