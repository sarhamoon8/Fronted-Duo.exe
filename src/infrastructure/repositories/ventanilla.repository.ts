import type { VentanillaRepository } from "@/core/domain/ports";
import type { Ventanilla } from "@/core/domain/entities/catalogo";
import { internalApi } from "../http/internal-client";
import type { VentanillaDto } from "../mappers";

/** GET /ventanillas a través del BFF (restringido a FUNCIONARIO/ADMIN en el backend). */
export class HttpVentanillaRepository implements VentanillaRepository {
  async listarPorPunto(puntoId: string): Promise<Ventanilla[]> {
    const { data } = await internalApi.get<VentanillaDto[]>("/bff/ventanillas", {
      params: { puntoId },
    });
    return data;
  }
}
