import type { CitaRepository, ProfesionalRepository } from "../../domain/ports";
import type { NuevaCita } from "../../domain/entities/cita";
import { AppError } from "../../domain/errors";

const REGEX_FECHA = /^\d{4}-\d{2}-\d{2}$/;

export class ConsultarDisponibilidadCitasUseCase {
  constructor(private readonly repo: CitaRepository) {}
  ejecutar(puntoId: string, especialidad: string, fecha: string) {
    if (!puntoId || !especialidad) {
      throw new AppError(["Elige la sede y la especialidad."], 400);
    }
    if (!REGEX_FECHA.test(fecha)) {
      throw new AppError(["Elige una fecha válida."], 400);
    }
    return this.repo.disponibilidad(puntoId, especialidad, fecha);
  }
}

export class AgendarCitaUseCase {
  constructor(private readonly repo: CitaRepository) {}
  ejecutar(datos: NuevaCita) {
    if (!datos.puntoId || !datos.especialidad || !datos.fechaHora) {
      throw new AppError(["Elige la sede, la especialidad y una hora para tu cita."], 400);
    }
    return this.repo.agendar(datos);
  }
}

export class MisCitasUseCase {
  constructor(private readonly repo: CitaRepository) {}
  ejecutar() {
    return this.repo.misCitas();
  }
}

export class CancelarCitaUseCase {
  constructor(private readonly repo: CitaRepository) {}
  ejecutar(citaId: string) {
    return this.repo.cancelar(citaId);
  }
}

export class ListarProfesionalesUseCase {
  constructor(private readonly repo: ProfesionalRepository) {}
  ejecutar(filtro?: { puntoId?: string; especialidad?: string }) {
    return this.repo.listar(filtro);
  }
}
