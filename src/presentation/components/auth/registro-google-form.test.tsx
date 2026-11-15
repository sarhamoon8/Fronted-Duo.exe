import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppError } from "@/core/domain/errors";
import { useSesionStore } from "@/presentation/stores/sesion.store";
import { guardarPendienteGoogle, leerPendienteGoogle } from "@/presentation/lib/registro-google";

const routerReplaceMock = vi.fn();
const routerRefreshMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerReplaceMock, refresh: routerRefreshMock }),
}));

const accederConGoogleMock = vi.fn();
vi.mock("@/infrastructure/container", () => ({
  casosDeUso: { accederConGoogle: { ejecutar: accederConGoogleMock } },
}));

const { RegistroGoogleForm } = await import("./registro-google-form");

const sesion = { id: "u1", nombre: "Ana", email: "ana@gmail.com", rol: "PACIENTE" as const, expiraEn: null };
const pendiente = { credential: "token-de-google", perfil: { email: "ana@gmail.com", nombres: "Ana", apellidos: "Pérez" } };

describe("RegistroGoogleForm", () => {
  beforeEach(() => {
    [routerReplaceMock, routerRefreshMock, accederConGoogleMock].forEach((m) => m.mockReset());
    useSesionStore.setState({ usuario: null, estado: "desconocido" });
    sessionStorage.clear();
    guardarPendienteGoogle(pendiente);
  });

  it("precarga los datos de Google y muestra con qué correo se creará la cuenta", () => {
    render(<RegistroGoogleForm pendiente={pendiente} />);

    expect(screen.getByText("ana@gmail.com")).toBeInTheDocument();
    expect(screen.getByLabelText(/^nombres$/i)).toHaveValue("Ana");
    expect(screen.getByLabelText(/^apellidos$/i)).toHaveValue("Pérez");
    expect(screen.queryByLabelText(/^contraseña$/i)).not.toBeInTheDocument();
  });

  it("exige el documento y aceptar los términos", async () => {
    render(<RegistroGoogleForm pendiente={pendiente} />);

    await userEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(await screen.findByText(/ingresa tu número de documento/i)).toBeInTheDocument();
    expect(screen.getByText(/debes aceptar los términos/i)).toBeInTheDocument();
    expect(accederConGoogleMock).not.toHaveBeenCalled();
  });

  it("crea la cuenta, limpia el pendiente y entra a /inicio", async () => {
    accederConGoogleMock.mockResolvedValue({ tipo: "sesion", sesion });
    render(<RegistroGoogleForm pendiente={pendiente} />);

    await userEvent.type(screen.getByLabelText(/número de documento/i), "555");
    await userEvent.click(screen.getByLabelText(/acepto los términos de uso/i));
    await userEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(accederConGoogleMock).toHaveBeenCalledWith(
      expect.objectContaining({
        credential: "token-de-google",
        numeroDocumento: "555",
        tipoDocumento: "CC",
        nombres: "Ana",
        apellidos: "Pérez",
        aceptaTerminos: true,
      }),
    );
    expect(routerReplaceMock).toHaveBeenCalledWith("/inicio");
    expect(leerPendienteGoogle()).toBeNull();
  });

  it("si la autorización de Google venció, avisa y descarta el pendiente", async () => {
    accederConGoogleMock.mockRejectedValue(new AppError(["No se pudo validar tu cuenta de Google"], 401));
    render(<RegistroGoogleForm pendiente={pendiente} />);

    await userEvent.type(screen.getByLabelText(/número de documento/i), "555");
    await userEvent.click(screen.getByLabelText(/acepto los términos de uso/i));
    await userEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(await screen.findByText("No se pudo validar tu cuenta de Google")).toBeInTheDocument();
    expect(leerPendienteGoogle()).toBeNull();
  });

  it("'Usar otro método' descarta el registro con Google", async () => {
    render(<RegistroGoogleForm pendiente={pendiente} />);

    await userEvent.click(screen.getByRole("button", { name: /usar otro método/i }));

    expect(leerPendienteGoogle()).toBeNull();
  });
});
