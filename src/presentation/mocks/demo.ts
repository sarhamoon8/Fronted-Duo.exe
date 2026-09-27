/**
 * DATOS DE EJEMPLO para las secciones del diseño que el backend todavía no
 * soporta (fórmulas, reservas, inventario, citas, red de sedes).
 *
 * Todo lo que se importe de aquí se marca en la interfaz con <MarcaDemo />.
 * Cuando el backend exponga estos recursos, reemplazar este archivo por un
 * repositorio real en src/infrastructure/repositories.
 */

export type Disponibilidad = "DISPONIBLE" | "BAJA" | "AGOTADO";

export interface MedicamentoFormulado {
  id: string;
  nombre: string;
  presentacion: string;
  posologia: string;
  disponibilidad: Disponibilidad;
  sedesConStock: number;
}

export const FORMULA_ACTIVA = {
  numero: "FM-2026-08419",
  emitida: "22 de septiembre de 2026",
  vigenteHasta: "22 oct",
  medico: "Dra. Valentina Gómez",
  especialidad: "Medicina general · Centro de Salud Chapinero",
  medicamentos: [
    { id: "m1", nombre: "Losartán 50 mg", presentacion: "Tabletas · Caja x 30", posologia: "1 tableta cada 24 horas", disponibilidad: "DISPONIBLE", sedesConStock: 6 },
    { id: "m2", nombre: "Acetaminofén 500 mg", presentacion: "Tabletas · Caja x 20", posologia: "1 tableta cada 8 horas", disponibilidad: "DISPONIBLE", sedesConStock: 4 },
    { id: "m3", nombre: "Atorvastatina 20 mg", presentacion: "Tabletas · Caja x 30", posologia: "1 tableta en la noche", disponibilidad: "BAJA", sedesConStock: 1 },
  ] satisfies MedicamentoFormulado[],
};

export interface SedeFarmacia {
  id: string;
  nombre: string;
  direccion: string;
  cobertura: number;
  total: number;
  horasReserva: number;
}

export const SEDES_FARMACIA: SedeFarmacia[] = [
  { id: "s1", nombre: "Farmacia Central Calle 80", direccion: "Av. Calle 80 # 69Q-22 · 2,1 km", cobertura: 3, total: 3, horasReserva: 48 },
  { id: "s2", nombre: "Droguería Red Salud Chapinero", direccion: "Cra. 13 # 53-44 · 1,2 km", cobertura: 2, total: 3, horasReserva: 36 },
  { id: "s3", nombre: "Farmacia IPS Galerías", direccion: "Calle 53B # 24-18 · 2,8 km", cobertura: 2, total: 3, horasReserva: 24 },
];

export const RESERVA_LISTA = {
  medicamentos: "Losartán 50 mg y Acetaminofén 500 mg",
  recogerAntesDe: "Domingo, 27 sep · 4:30 p. m.",
  listos: "2 de 3",
  vigenciaHoras: 32,
};

export const PROXIMA_CITA = { fecha: "28 sep", detalle: "Medicina general · 9:40 a. m." };

export interface ItemInventario {
  nombre: string;
  cobertura: string;
  unidades: number;
  estado: "DISPONIBLE" | "STOCK_BAJO" | "AGOTADO";
}

export const INVENTARIO_CRITICO: ItemInventario[] = [
  { nombre: "Losartán 50 mg", cobertura: "18 días", unidades: 1248, estado: "DISPONIBLE" },
  { nombre: "Acetaminofén 500 mg", cobertura: "11 días", unidades: 862, estado: "DISPONIBLE" },
  { nombre: "Atorvastatina 20 mg", cobertura: "2 días", unidades: 94, estado: "STOCK_BAJO" },
  { nombre: "Metformina 850 mg", cobertura: "Sin cobertura", unidades: 0, estado: "AGOTADO" },
];

export const ESTADO_RED = { ventanillas: "26 / 29", alertas: 3, incidentes: 0 };
