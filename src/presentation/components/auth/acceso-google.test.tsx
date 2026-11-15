import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppError } from "@/core/domain/errors";
import { useSesionStore } from "@/presentation/stores/sesion.store";
import { leerPendienteGoogle } from "@/presentation/lib/registro-google";

const routerReplaceMock = vi.fn();
const routerPushMock = vi.fn();
const routerRefreshMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerReplaceMock, push: routerPushMock, refresh: routerRefreshMock }),
}));

const accederConGoogleMock = vi.fn();
vi.mock("@/infrastructure/container", () => ({
  casosDeUso: { accederConGoogle: { ejecutar: accederConGoogleMock } },
}));

// El botón real carga la librería de Google; aquí se simula con dos botones.
vi.mock("./boton-google", () => ({
  BotonGoogle: ({ onCredential, onNoDisponible }: { onCredential: (c: string) => void; onNoDisponible: () => void }) => (
    <>
      <button onClick={() => onCredential("token-de-google")}>elegir cuenta</button>
      <button onClick={onNoDisponible}>sin configurar</button>
    </>
  ),
}));

const { AccesoGoogle } = await import("./acceso-google");

const sesion = { id: "u1", nombre: "Ana", email: "ana@gmail.com", rol: "PACIENTE" as const, expiraEn: null };
const perfil = { email: "ana@gmail.com", nombres: "Ana", apellidos: "Pérez" };

describe("AccesoGoogle", () => {
  beforeEach(() => {
    [routerReplaceMock, routerPushMock, routerRefreshMock, accederConGoogleMock].forEach((m) => m.mockReset());
    useSesionStore.setState({ usuario: null, estado: "desconocido" });
    sessionStorage.clear();
  });

  it("inicia sesión y va al destino cuando el correo ya tiene cuenta", async () => {
    accederConGoogleMock.mockResolvedValue({ tipo: "sesion", sesion });
    render(<AccesoGoogle destino="/turnos" />);

    await userEvent.click(screen.getByRole("button", { name: "elegir cuenta" }));

    expect(accederConGoogleMock).toHaveBeenCalledWith({ credential: "token-de-google" });
    expect(routerReplaceMock).toHaveBeenCalledWith("/turnos");
    expect(routerRefreshMock).toHaveBeenCalled();
  });

  it("si falta completar el registro guarda el perfil y lleva a /registro", async () => {
    accederConGoogleMock.mockResolvedValue({ tipo: "incompleto", perfil });
    render(<AccesoGoogle />);

    await userEvent.click(screen.getByRole("button", { name: "elegir cuenta" }));

    expect(leerPendienteGoogle()).toEqual({ credential: "token-de-google", perfil });
    expect(routerPushMock).toHaveBeenCalledWith("/registro");
    expect(routerReplaceMock).not.toHaveBeenCalled();
  });

  it("en /registro avisa al formulario en lugar de navegar", async () => {
    accederConGoogleMock.mockResolvedValue({ tipo: "incompleto", perfil });
    const alIncompleto = vi.fn();
    render(<AccesoGoogle onIncompleto={alIncompleto} />);

    await userEvent.click(screen.getByRole("button", { name: "elegir cuenta" }));

    expect(alIncompleto).toHaveBeenCalledWith({ credential: "token-de-google", perfil });
    expect(routerPushMock).not.toHaveBeenCalled();
  });

  it("muestra el error si Google no se pudo validar", async () => {
    accederConGoogleMock.mockRejectedValue(new AppError(["No se pudo validar tu cuenta de Google"], 401));
    render(<AccesoGoogle />);

    await userEvent.click(screen.getByRole("button", { name: "elegir cuenta" }));

    expect(await screen.findByText("No se pudo validar tu cuenta de Google")).toBeInTheDocument();
    expect(routerReplaceMock).not.toHaveBeenCalled();
  });

  it("avisa cuando el acceso con Google no está configurado", async () => {
    render(<AccesoGoogle />);

    await userEvent.click(screen.getByRole("button", { name: "sin configurar" }));

    expect(screen.getByText(/todavía no está activado/i)).toBeInTheDocument();
  });
});
