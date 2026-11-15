import type { ProfesionalRepository } from "@/core/domain/ports";
import type { Profesional } from "@/core/domain/entities/cita";
import { internalApi } from "../http/internal-client";

/** GET /profesionales?puntoId&especialidad (público en el backend). */
export class HttpProfesionalRepository implements ProfesionalRepository {
  async listar(filtro: { puntoId?: string; especialidad?: string } = {}): Promise<Profesional[]> {
    const { data } = await internalApi.get<Profesional[]>("/bff/profesionales", { params: filtro });
    return data;
  }
}
