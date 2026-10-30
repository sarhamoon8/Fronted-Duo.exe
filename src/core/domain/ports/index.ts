/**
 * Puertos (interfaces) del dominio. La capa de aplicación depende de estas
 * abstracciones; la infraestructura (Axios) las implementa.
 */
import type { EntidadMedica, PuntoDispensacion, Servicio, Ventanilla } from "../entities/catalogo";
import type { InscripcionEspera } from "../entities/lista-espera";
import type { ExistenciaMedicamento, Medicamento } from "../entities/medicamento";
import type { Notificacion } from "../entities/notificacion";
import type { Sesion } from "../entities/sesion";
import type { Turno } from "../entities/turno";
import type { Credenciales, DatosRegistro, NuevoUsuario, Usuario } from "../entities/usuario";

export interface AuthRepository {
  iniciarSesion(credenciales: Credenciales): Promise<Sesion>;
  registrarse(datos: DatosRegistro): Promise<Sesion>;
  cerrarSesion(): Promise<void>;
  obtenerSesion(): Promise<Sesion | null>;
}

export interface CatalogoRepository {
  listarEntidades(): Promise<EntidadMedica[]>;
  crearEntidad(nombre: string): Promise<EntidadMedica>;
  listarServicios(entidadId?: string): Promise<Servicio[]>;
  crearServicio(
    codigoServicio: string,
    nombre: string,
    tiempoPromedioMin: number,
    entidadId: string,
  ): Promise<Servicio>;
  listarPuntos(entidadId?: string): Promise<PuntoDispensacion[]>;
  crearPunto(datos: NuevoPunto): Promise<PuntoDispensacion>;
}

/** Espejo de CrearPuntoDispensacionDto (POST /puntos-dispensacion, solo ADMIN). */
export interface NuevoPunto {
  entidadId: string;
  nombreSede: string;
  direccion: string;
  ciudad: string;
  telefonoContacto?: string;
  capacidadAtencion: number;
}

export interface VentanillaRepository {
  listarPorPunto(puntoId: string): Promise<Ventanilla[]>;
  crear(puntoId: string, numeroModulo: string): Promise<Ventanilla>;
}

export interface TurnoRepository {
  solicitar(servicioId: string, puntoId: string): Promise<Turno>;
  cancelar(turnoId: string): Promise<Turno>;
  /** ventanillaId es obligatorio para llamar un turno PENDIENTE; no aplica al finalizar uno EN_CURSO. */
  avanzar(turnoId: string, ventanillaId?: string): Promise<Turno>;
  /** servicioId es opcional: sin él trae todos los servicios del punto. */
  listarPorPunto(puntoId: string, servicioId?: string): Promise<Turno[]>;
  misTurnos(): Promise<Turno[]>;
}

export interface UsuarioRepository {
  listar(): Promise<Usuario[]>;
  crear(datos: NuevoUsuario): Promise<Usuario>;
}

export interface ListaEsperaRepository {
  unirse(servicioId: string, puntoId: string): Promise<InscripcionEspera>;
  misInscripciones(): Promise<InscripcionEspera[]>;
  salir(inscripcionId: string): Promise<void>;
}

export interface NotificacionRepository {
  misNotificaciones(): Promise<Notificacion[]>;
  marcarLeida(notificacionId: string): Promise<Notificacion>;
}

/** Espejo de CrearMedicamentoDto (POST /medicamentos, solo ADMIN). */
export interface NuevoMedicamento {
  codigoNacional: string;
  nombreGenerico: string;
  concentracion: string;
  presentacion: string;
  laboratorioFabricante: string;
  requiereAutorizacion?: boolean;
}

/** Espejo de CrearInventarioDto (POST /inventario, FUNCIONARIO o ADMIN). */
export interface NuevaExistencia {
  puntoId: string;
  medicamentoId: string;
  lote: string;
  stockActual: number;
  fechaVencimiento: string;
}

export interface MedicamentoRepository {
  listar(): Promise<Medicamento[]>;
  crear(datos: NuevoMedicamento): Promise<Medicamento>;
  existenciasPorPunto(puntoId: string, medicamentoId?: string): Promise<ExistenciaMedicamento[]>;
  registrarExistencia(datos: NuevaExistencia): Promise<ExistenciaMedicamento>;
}
