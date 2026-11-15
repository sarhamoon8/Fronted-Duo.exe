import type { CitaRepository } from "@/core/domain/ports";
import type { Cita, DisponibilidadCitas, NuevaCita } from "@/core/domain/entities/cita";
import { internalApi } from "../http/internal-client";
import { CitaMapper, DisponibilidadCitasMapper, type CitaDto, type DisponibilidadCitasDto } from "../mappers";

/**
 * Endpoints de CitaController:
 *   GET   /citas/disponibilidad?puntoId&especialidad&fecha   (horas libres)
 *   POST  /citas                                             (asigna doctor automáticamente)
 *   GET   /citas/mis-citas
 *   PATCH /citas/:id/cancelar
 *   PATCH /citas/:id/reprogramar   (mismo doctor si está libre, si no otro)
 */
export class HttpCitaRepository implements CitaRepository {
  async disponibilidad(puntoId: string, especialidad: string, fecha: string): Promise<DisponibilidadCitas> {
    const { data } = await internalApi.get<DisponibilidadCitasDto>("/bff/citas/disponibilidad", {
      params: { puntoId, especialidad, fecha },
    });
    return DisponibilidadCitasMapper.toDomain(data);
  }

  async agendar(datos: NuevaCita): Promise<Cita> {
    const { data } = await internalApi.post<CitaDto>("/bff/citas", datos);
    return CitaMapper.toDomain(data);
  }

  async misCitas(): Promise<Cita[]> {
    const { data } = await internalApi.get<CitaDto[]>("/bff/citas/mis-citas");
    return data.map(CitaMapper.toDomain);
  }

  async reprogramar(citaId: string, fechaHora: string): Promise<Cita> {
    const { data } = await internalApi.patch<CitaDto>(`/bff/citas/${encodeURIComponent(citaId)}/reprogramar`, { fechaHora });
    return CitaMapper.toDomain(data);
  }

  async cancelar(citaId: string): Promise<Cita> {
    const { data } = await internalApi.patch<CitaDto>(`/bff/citas/${encodeURIComponent(citaId)}/cancelar`);
    return CitaMapper.toDomain(data);
  }
}
