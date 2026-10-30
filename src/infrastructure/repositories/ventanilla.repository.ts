import type { VentanillaRepository } from "@/core/domain/ports";
import type { Ventanilla } from "@/core/domain/entities/catalogo";
import { internalApi } from "../http/internal-client";
import type { VentanillaDto } from "../mappers";

/** GET y POST /ventanillas a través del BFF (restringido a FUNCIONARIO/ADMIN en el backend). */
export class HttpVentanillaRepository implements VentanillaRepository {
  async listarPorPunto(puntoId: string): Promise<Ventanilla[]> {
    const { data } = await internalApi.get<VentanillaDto[]>("/bff/ventanillas", {
      params: { puntoId },
    });
    return data;
  }

  async crear(puntoId: string, numeroModulo: string): Promise<Ventanilla> {
    const { data } = await internalApi.post<VentanillaDto>("/bff/ventanillas", { puntoId, numeroModulo });
    return data;
  }
}
