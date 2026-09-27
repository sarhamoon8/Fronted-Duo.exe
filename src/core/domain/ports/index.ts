/**
 * Puertos (interfaces) del dominio. La capa de aplicación depende de estas
 * abstracciones; la infraestructura (Axios) las implementa.
 */
import type { EntidadMedica, Servicio } from "../entities/catalogo";
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
}

export interface TurnoRepository {
  solicitar(servicioId: string): Promise<Turno>;
  cancelar(turnoId: string): Promise<Turno>;
  avanzar(turnoId: string): Promise<Turno>;
  listarPorServicio(servicioId: string): Promise<Turno[]>;
}

export interface UsuarioRepository {
  listar(): Promise<Usuario[]>;
  crear(datos: NuevoUsuario): Promise<Usuario>;
}

