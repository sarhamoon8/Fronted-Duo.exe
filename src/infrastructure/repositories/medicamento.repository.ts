import type { MedicamentoRepository, NuevaExistencia, NuevoMedicamento } from "@/core/domain/ports";
import type { ExistenciaMedicamento, Medicamento } from "@/core/domain/entities/medicamento";
import { internalApi } from "../http/internal-client";
import { ExistenciaMedicamentoMapper, type ExistenciaMedicamentoDto } from "../mappers";

/**
 * Endpoints de MedicamentoController e InventarioController:
 *   GET  /medicamentos                           (público; catálogo)
 *   POST /medicamentos                           (solo ADMIN)
 *   GET  /inventario?puntoId=&medicamentoId=     (público; existencias de una sede)
 *   POST /inventario                             (FUNCIONARIO o ADMIN)
 */
export class HttpMedicamentoRepository implements MedicamentoRepository {
  async listar(): Promise<Medicamento[]> {
    const { data } = await internalApi.get<Medicamento[]>("/bff/medicamentos");
    return data;
  }

  async crear(datos: NuevoMedicamento): Promise<Medicamento> {
    const { data } = await internalApi.post<Medicamento>("/bff/medicamentos", datos);
    return data;
  }

  async existenciasPorPunto(puntoId: string, medicamentoId?: string): Promise<ExistenciaMedicamento[]> {
    const { data } = await internalApi.get<ExistenciaMedicamentoDto[]>("/bff/inventario", {
      params: medicamentoId ? { puntoId, medicamentoId } : { puntoId },
    });
    return data.map(ExistenciaMedicamentoMapper.toDomain);
  }

  async registrarExistencia(datos: NuevaExistencia): Promise<ExistenciaMedicamento> {
    const { data } = await internalApi.post<ExistenciaMedicamentoDto>("/bff/inventario", datos);
    return ExistenciaMedicamentoMapper.toDomain(data);
  }
}
