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
  ListarPuntosUseCase,
  ListarServiciosUseCase,
  ListarUsuariosUseCase,
} from "@/core/application/use-cases/catalogo.use-cases";
import {
  AvanzarTurnoUseCase,
  CancelarTurnoUseCase,
  ConsultarFilaUseCase,
  MisTurnosUseCase,
  SolicitarTurnoUseCase,
} from "@/core/application/use-cases/turnos.use-cases";
import { ListarVentanillasUseCase } from "@/core/application/use-cases/ventanillas.use-cases";
import { HttpAuthRepository } from "./repositories/auth.repository";
import { HttpCatalogoRepository } from "./repositories/catalogo.repository";
import { HttpTurnoRepository } from "./repositories/turno.repository";
import { HttpUsuarioRepository } from "./repositories/usuario.repository";
import { HttpVentanillaRepository } from "./repositories/ventanilla.repository";

const authRepo = new HttpAuthRepository();
const catalogoRepo = new HttpCatalogoRepository();
const turnoRepo = new HttpTurnoRepository();
const usuarioRepo = new HttpUsuarioRepository();
const ventanillaRepo = new HttpVentanillaRepository();

export const casosDeUso = {
  iniciarSesion: new IniciarSesionUseCase(authRepo),
  registrarse: new RegistrarseUseCase(authRepo),
  cerrarSesion: new CerrarSesionUseCase(authRepo),

  listarEntidades: new ListarEntidadesUseCase(catalogoRepo),
  listarServicios: new ListarServiciosUseCase(catalogoRepo),
  listarPuntos: new ListarPuntosUseCase(catalogoRepo),
  crearEntidad: new CrearEntidadUseCase(catalogoRepo),
  crearServicio: new CrearServicioUseCase(catalogoRepo),

  listarVentanillas: new ListarVentanillasUseCase(ventanillaRepo),

  solicitarTurno: new SolicitarTurnoUseCase(turnoRepo),
  cancelarTurno: new CancelarTurnoUseCase(turnoRepo),
  avanzarTurno: new AvanzarTurnoUseCase(turnoRepo),
  consultarFila: new ConsultarFilaUseCase(turnoRepo),
  misTurnos: new MisTurnosUseCase(turnoRepo),

  listarUsuarios: new ListarUsuariosUseCase(usuarioRepo),
  crearUsuario: new CrearUsuarioUseCase(usuarioRepo),

} as const;
