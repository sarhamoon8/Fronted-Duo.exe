import { describe, expect, it } from "vitest";
import { UsuarioMapper, TurnoMapper, type UsuarioDto, type TurnoDto } from "./index";

describe("UsuarioMapper", () => {
  it("convierte creadoEn a Date y conserva el resto de campos", () => {
    const dto: UsuarioDto = {
      id: "u1",
      numeroDocumento: "123",
      tipoDocumento: "CC",
      nombres: "Ana",
      apellidos: "Pérez",
      email: "ana@correo.co",
      telefono: null,
      rol: "PACIENTE",
      creadoEn: "2026-01-15T10:00:00Z",
    };

    const usuario = UsuarioMapper.toDomain(dto);

    expect(usuario.creadoEn).toBeInstanceOf(Date);
    expect(usuario.rol).toBe("PACIENTE");
    expect(usuario.id).toBe("u1");
  });
});

describe("TurnoMapper", () => {
  it("convierte fechas string a Date y null se mantiene null", () => {
    const dto: TurnoDto = {
      id: "t1",
      usuarioId: "u1",
      servicioId: "s1",
      puntoId: "p1",
      ventanillaId: null,
      codigoAlfanumerico: "A01",
      estado: "PENDIENTE",
      prioridad: false,
      posicion: 3,
      horaLlamado: null,
      horaFinalizacion: null,
      creadoEn: "2026-01-15T10:00:00Z",
    };

    const turno = TurnoMapper.toDomain(dto);

    expect(turno.creadoEn).toBeInstanceOf(Date);
    expect(turno.horaLlamado).toBeNull();
    expect(turno.horaFinalizacion).toBeNull();
    expect(turno.estado).toBe("PENDIENTE");
  });

  it("convierte horaLlamado y horaFinalizacion cuando vienen presentes", () => {
    const dto: TurnoDto = {
      id: "t2",
      usuarioId: "u1",
      servicioId: "s1",
      puntoId: "p1",
      ventanillaId: "v1",
      codigoAlfanumerico: "A02",
      estado: "ATENDIDO",
      prioridad: true,
      posicion: null,
      horaLlamado: "2026-01-15T10:05:00Z",
      horaFinalizacion: "2026-01-15T10:15:00Z",
      creadoEn: "2026-01-15T10:00:00Z",
    };

    const turno = TurnoMapper.toDomain(dto);

    expect(turno.horaLlamado).toBeInstanceOf(Date);
    expect(turno.horaFinalizacion).toBeInstanceOf(Date);
  });
});
