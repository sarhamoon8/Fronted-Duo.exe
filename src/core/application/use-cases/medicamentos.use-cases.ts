import type { MedicamentoRepository, NuevaExistencia, NuevoMedicamento } from "../../domain/ports";
import { AppError } from "../../domain/errors";

export class ListarMedicamentosUseCase {
  constructor(private readonly repo: MedicamentoRepository) {}
  ejecutar() {
    return this.repo.listar();
  }
}

export class ConsultarExistenciasUseCase {
  constructor(private readonly repo: MedicamentoRepository) {}
  ejecutar(puntoId: string, medicamentoId?: string) {
    if (!puntoId) throw new AppError(["Elige una sede para ver las existencias."], 400);
    return this.repo.existenciasPorPunto(puntoId, medicamentoId);
  }
}

export class CrearMedicamentoUseCase {
  constructor(private readonly repo: MedicamentoRepository) {}
  ejecutar(datos: NuevoMedicamento) {
    const errores: string[] = [];
    if (!datos.codigoNacional.trim()) errores.push("El código nacional es obligatorio.");
    if (!datos.nombreGenerico.trim()) errores.push("El nombre genérico es obligatorio.");
    if (!datos.concentracion.trim()) errores.push("La concentración es obligatoria.");
    if (!datos.presentacion.trim()) errores.push("La presentación es obligatoria.");
    if (!datos.laboratorioFabricante.trim()) errores.push("El laboratorio es obligatorio.");
    if (errores.length) throw new AppError(errores, 400);
    return this.repo.crear(datos);
  }
}

export class RegistrarExistenciaUseCase {
  constructor(private readonly repo: MedicamentoRepository) {}
  ejecutar(datos: NuevaExistencia) {
    const errores: string[] = [];
    if (!datos.puntoId) errores.push("Elige la sede.");
    if (!datos.medicamentoId) errores.push("Elige el medicamento.");
    if (!datos.lote.trim()) errores.push("El lote es obligatorio.");
    if (!Number.isInteger(datos.stockActual) || datos.stockActual < 0) {
      errores.push("Las unidades deben ser un número entero mayor o igual a 0.");
    }
    if (!datos.fechaVencimiento) errores.push("La fecha de vencimiento es obligatoria.");
    if (errores.length) throw new AppError(errores, 400);
    return this.repo.registrarExistencia(datos);
  }
}
