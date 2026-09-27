"use client";

/**
 * Composición raíz del lado del cliente: aquí (y solo aquí) se decide qué
 * implementación concreta satisface cada puerto del dominio.
 */
import {
  CerrarSesionUseCase,
  IniciarSesionUseCase,
  RegistrarseUseCase,
} from "@/core/application/use-cases/auth.use-cases";
import {
  CrearEntidadUseCase,
  CrearServicioUseCase,
  CrearUsuarioUseCase,
  ListarEntidadesUseCase,
  ListarServiciosUseCase,
  ListarUsuariosUseCase,
} from "@/core/application/use-cases/catalogo.use-cases";
import {
  AvanzarTurnoUseCase,
  CancelarTurnoUseCase,
  ConsultarFilaUseCase,
  SolicitarTurnoUseCase,
} from "@/core/application/use-cases/turnos.use-cases";
import { HttpAuthRepository } from "./repositories/auth.repository";
import { HttpCatalogoRepository } from "./repositories/catalogo.repository";
import { HttpTurnoRepository } from "./repositories/turno.repository";
import { HttpUsuarioRepository } from "./repositories/usuario.repository";

const authRepo = new HttpAuthRepository();
const catalogoRepo = new HttpCatalogoRepository();
const turnoRepo = new HttpTurnoRepository();
const usuarioRepo = new HttpUsuarioRepository();

export const casosDeUso = {
  iniciarSesion: new IniciarSesionUseCase(authRepo),
  registrarse: new RegistrarseUseCase(authRepo),
  cerrarSesion: new CerrarSesionUseCase(authRepo),

  listarEntidades: new ListarEntidadesUseCase(catalogoRepo),
  listarServicios: new ListarServiciosUseCase(catalogoRepo),
  crearEntidad: new CrearEntidadUseCase(catalogoRepo),
  crearServicio: new CrearServicioUseCase(catalogoRepo),

  solicitarTurno: new SolicitarTurnoUseCase(turnoRepo),
  cancelarTurno: new CancelarTurnoUseCase(turnoRepo),
  avanzarTurno: new AvanzarTurnoUseCase(turnoRepo),
  consultarFila: new ConsultarFilaUseCase(turnoRepo),

  listarUsuarios: new ListarUsuariosUseCase(usuarioRepo),
  crearUsuario: new CrearUsuarioUseCase(usuarioRepo),

} as const;
