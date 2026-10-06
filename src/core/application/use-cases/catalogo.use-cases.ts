import type { CatalogoRepository, UsuarioRepository } from "../../domain/ports";
import type { NuevoUsuario } from "../../domain/entities/usuario";
import { validarRegistro } from "./auth.use-cases";
import { AppError } from "../../domain/errors";

export class ListarEntidadesUseCase {
  constructor(private readonly repo: CatalogoRepository) {}
  ejecutar() {
    return this.repo.listarEntidades();
  }
}

export class ListarServiciosUseCase {
  constructor(private readonly repo: CatalogoRepository) {}
  ejecutar(entidadId?: string) {
    return this.repo.listarServicios(entidadId);
  }
}

export class ListarPuntosUseCase {
  constructor(private readonly repo: CatalogoRepository) {}
  ejecutar(entidadId?: string) {
    return this.repo.listarPuntos(entidadId);
  }
}

export class CrearEntidadUseCase {
  constructor(private readonly repo: CatalogoRepository) {}
  ejecutar(nombre: string) {
    if (!nombre.trim()) throw new AppError(["El nombre de la entidad es obligatorio."], 400);
    return this.repo.crearEntidad(nombre.trim());
  }
}

export class CrearServicioUseCase {
  constructor(private readonly repo: CatalogoRepository) {}
  ejecutar(codigoServicio: string, nombre: string, tiempoPromedioMin: number, entidadId: string) {
    const errores: string[] = [];
    if (!codigoServicio.trim()) errores.push("El código del servicio es obligatorio.");
    if (!nombre.trim()) errores.push("El nombre del servicio es obligatorio.");
    if (!Number.isInteger(tiempoPromedioMin) || tiempoPromedioMin < 1) {
      errores.push("El tiempo promedio debe ser un número entero mayor a 0.");
    }
    if (!entidadId) errores.push("Selecciona la entidad médica.");
    if (errores.length) throw new AppError(errores, 400);
    return this.repo.crearServicio(codigoServicio.trim(), nombre.trim(), tiempoPromedioMin, entidadId);
  }
}

export class ListarUsuariosUseCase {
  constructor(private readonly repo: UsuarioRepository) {}
  ejecutar() {
    return this.repo.listar();
  }
}

export class CrearUsuarioUseCase {
  constructor(private readonly repo: UsuarioRepository) {}
  ejecutar(datos: NuevoUsuario) {
    const errores = validarRegistro(datos);
    if (errores.length) throw new AppError(errores, 400);
    return this.repo.crear({
      ...datos,
      numeroDocumento: datos.numeroDocumento.trim(),
      tipoDocumento: datos.tipoDocumento.trim(),
      nombres: datos.nombres.trim(),
      apellidos: datos.apellidos.trim(),
      email: datos.email.trim().toLowerCase(),
      telefono: datos.telefono?.trim() || undefined,
    });
  }
}
