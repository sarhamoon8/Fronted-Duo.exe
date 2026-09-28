/**
 * Puertos (interfaces) del dominio. La capa de aplicación depende de estas
 * abstracciones; la infraestructura (Axios) las implementa.
 */
import type { EntidadMedica, PuntoDispensacion, Servicio, Ventanilla } from "../entities/catalogo";
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
  crearServicio(nombre: string, entidadId: string): Promise<Servicio>;
  listarPuntos(entidadId?: string): Promise<PuntoDispensacion[]>;
}

export interface VentanillaRepository {
  listarPorPunto(puntoId: string): Promise<Ventanilla[]>;
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
