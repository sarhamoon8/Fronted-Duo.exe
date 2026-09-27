import type { CatalogoRepository } from "@/core/domain/ports";
import type { EntidadMedica, Servicio } from "@/core/domain/entities/catalogo";
import { internalApi } from "../http/internal-client";
import type { EntidadMedicaDto, ServicioDto } from "../mappers";

/** GET/POST /entidades-medicas y /servicios a través del BFF. */
export class HttpCatalogoRepository implements CatalogoRepository {
  async listarEntidades(): Promise<EntidadMedica[]> {
    const { data } = await internalApi.get<EntidadMedicaDto[]>("/bff/entidades-medicas");
    return data;
  }

  async crearEntidad(nombre: string): Promise<EntidadMedica> {
    const { data } = await internalApi.post<EntidadMedicaDto>("/bff/entidades-medicas", { nombre });
    return data;
  }

  async listarServicios(entidadId?: string): Promise<Servicio[]> {
    const { data } = await internalApi.get<ServicioDto[]>("/bff/servicios", {
      params: entidadId ? { entidadId } : undefined,
    });
    return data;
  }

  async crearServicio(nombre: string, entidadId: string): Promise<Servicio> {
    const { data } = await internalApi.post<ServicioDto>("/bff/servicios", { nombre, entidadId });
    return data;
  }
}
