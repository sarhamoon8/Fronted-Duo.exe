import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { EntidadMedica, PuntoDispensacion } from "@/core/domain/entities/catalogo";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const entidades: EntidadMedica[] = [
  { id: "e1", nombre: "Nueva EPS" },
  { id: "e2", nombre: "Sanitas EPS" },
  { id: "e3", nombre: "Sura EPS" },
];

function punto(id: string, entidadId: string, ciudad: string, zona: string | null): PuntoDispensacion {
  return {
    id,
    entidadId,
    nombreSede: `Sede ${id}`,
    direccion: "Calle 1",
    ciudad,
    zona,
    telefonoContacto: null,
    capacidadAtencion: 10,
  };
}

const puntos: PuntoDispensacion[] = [
  punto("p1", "e1", "Bogotá D. C.", "Chapinero"),
  punto("p2", "e1", "Bogotá D. C.", "Suba"),
  punto("p3", "e2", "Bogotá D. C.", "Suba"),
  punto("p4", "e3", "Medellín", "El Poblado"),
  punto("p5", "e1", "Cali", null),
];

const listarEntidades = vi.fn();
const listarPuntos = vi.fn();
const listarServicios = vi.fn();
vi.mock("@/infrastructure/container", () => ({
  casosDeUso: {
    listarEntidades: { ejecutar: listarEntidades },
    listarPuntos: { ejecutar: listarPuntos },
    listarServicios: { ejecutar: listarServicios },
    solicitarTurno: { ejecutar: vi.fn() },
  },
}));

const { SolicitarTurno } = await import("./solicitar-turno");

describe("SolicitarTurno · filtros de ciudad y zona", () => {
  beforeEach(() => {
    listarEntidades.mockReset().mockResolvedValue(entidades);
    listarPuntos
      .mockReset()
      .mockImplementation((entidadId?: string) =>
        Promise.resolve(entidadId ? puntos.filter((p) => p.entidadId === entidadId) : puntos),
      );
    listarServicios.mockReset().mockResolvedValue([]);
  });

  it("ofrece las ciudades y zonas reales y parte de Bogotá con sus centros médicos", async () => {
    render(<SolicitarTurno />);

    const ciudad = await screen.findByLabelText("Ciudad");
    const opcionesCiudad = within(ciudad).getAllByRole("option").map((o) => o.textContent);
    expect(opcionesCiudad).toEqual(["Todas las ciudades", "Bogotá D. C.", "Cali", "Medellín"]);
    expect(ciudad).toHaveValue("Bogotá D. C.");

    const zona = screen.getByLabelText("Zona o barrio");
    expect(within(zona).getAllByRole("option").map((o) => o.textContent)).toEqual([
      "Todas las zonas",
      "Chapinero",
      "Suba",
    ]);

    expect(await screen.findByLabelText(/Nueva EPS/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sanitas EPS/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Sura EPS/)).not.toBeInTheDocument();
  });

  it("al elegir una zona solo muestra los centros médicos que tienen sede allí", async () => {
    render(<SolicitarTurno />);

    await userEvent.selectOptions(await screen.findByLabelText("Zona o barrio"), "Chapinero");

    expect(screen.getByLabelText(/Nueva EPS/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Sanitas EPS/)).not.toBeInTheDocument();
  });

  it("al cambiar de ciudad actualiza las zonas y los centros médicos", async () => {
    render(<SolicitarTurno />);

    await userEvent.selectOptions(await screen.findByLabelText("Ciudad"), "Medellín");

    expect(
      within(screen.getByLabelText("Zona o barrio")).getAllByRole("option").map((o) => o.textContent),
    ).toEqual(["Todas las zonas", "El Poblado"]);
    expect(screen.getByLabelText(/Sura EPS/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Nueva EPS/)).not.toBeInTheDocument();
  });

  it("con «Todas las ciudades» aparecen todos los centros médicos", async () => {
    render(<SolicitarTurno />);

    await userEvent.selectOptions(await screen.findByLabelText("Ciudad"), "");

    expect(screen.getByLabelText(/Nueva EPS/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sanitas EPS/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sura EPS/)).toBeInTheDocument();
  });

  it("los puntos de atención de la sede elegida respetan la zona filtrada", async () => {
    render(<SolicitarTurno />);

    await userEvent.selectOptions(await screen.findByLabelText("Zona o barrio"), "Suba");
    await userEvent.click(await screen.findByLabelText(/Nueva EPS/));

    expect(await screen.findByLabelText(/Sede p2/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Sede p1/)).not.toBeInTheDocument();
  });
});
