import type { ListaEsperaRepository } from "@/core/domain/ports";
import type { InscripcionEspera } from "@/core/domain/entities/lista-espera";
import { internalApi } from "../http/internal-client";
import { InscripcionEsperaMapper, type InscripcionEsperaDto } from "../mappers";

/**
 * Endpoints de ListaEsperaController:
 *   POST   /lista-espera                     (autenticado; el usuario sale del token)
 *   GET    /lista-espera/mis-inscripciones   (autenticado)
 *   DELETE /lista-espera/:id                 (dueño de la inscripción o personal)
 */
export class HttpListaEsperaRepository implements ListaEsperaRepository {
  async unirse(servicioId: string, puntoId: string): Promise<InscripcionEspera> {
    const { data } = await internalApi.post<InscripcionEsperaDto>("/bff/lista-espera", { servicioId, puntoId });
    return InscripcionEsperaMapper.toDomain(data);
  }

  async misInscripciones(): Promise<InscripcionEspera[]> {
    const { data } = await internalApi.get<InscripcionEsperaDto[]>("/bff/lista-espera/mis-inscripciones");
    return data.map(InscripcionEsperaMapper.toDomain);
  }

  async salir(inscripcionId: string): Promise<void> {
    await internalApi.delete(`/bff/lista-espera/${encodeURIComponent(inscripcionId)}`);
  }
}
