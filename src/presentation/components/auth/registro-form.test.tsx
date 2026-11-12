import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppError } from "@/core/domain/errors";
import { useSesionStore } from "@/presentation/stores/sesion.store";

const routerReplaceMock = vi.fn();
const routerRefreshMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerReplaceMock, refresh: routerRefreshMock }),
  useSearchParams: () => new URLSearchParams(),
}));

const registrarseMock = vi.fn();
vi.mock("@/infrastructure/container", () => ({
  casosDeUso: { registrarse: { ejecutar: registrarseMock } },
}));

const { RegistroForm } = await import("./registro-form");

async function llenarFormularioValido(usuario: ReturnType<typeof userEvent.setup>) {
  await usuario.type(screen.getByLabelText(/número de documento/i), "123456789");
  await usuario.type(screen.getByLabelText(/^nombres$/i), "Ana");
  await usuario.type(screen.getByLabelText(/apellidos/i), "Pérez");
  await usuario.type(screen.getByLabelText(/correo electrónico/i), "ana@example.com");
  await usuario.type(screen.getByLabelText(/contraseña/i), "clave123");
}

describe("RegistroForm", () => {
  beforeEach(() => {
    routerReplaceMock.mockReset();
    routerRefreshMock.mockReset();
    registrarseMock.mockReset();
    useSesionStore.setState({ usuario: null, estado: "desconocido" });
  });

  it("muestra errores de validación sin llamar al caso de uso si falta algo", async () => {
    const usuario = userEvent.setup();
    render(<RegistroForm />);

    await usuario.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(await screen.findByText(/ingresa tu número de documento/i)).toBeInTheDocument();
    expect(registrarseMock).not.toHaveBeenCalled();
  });

  it("registra, guarda la sesión y redirige a /inicio", async () => {
    registrarseMock.mockResolvedValue({
      id: "u1",
      nombre: "Ana",
      email: "ana@example.com",
      rol: "PACIENTE",
      expiraEn: null,
    });
    const usuario = userEvent.setup();
    render(<RegistroForm />);

    await llenarFormularioValido(usuario);
    await usuario.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(registrarseMock).toHaveBeenCalled();
    expect(routerReplaceMock).toHaveBeenCalledWith("/inicio");
  });

  it("muestra los mensajes del backend si el registro es rechazado", async () => {
    registrarseMock.mockRejectedValue(new AppError(["El correo ya está registrado"], 409));
    const usuario = userEvent.setup();
    render(<RegistroForm />);

    await llenarFormularioValido(usuario);
    await usuario.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(await screen.findByText("El correo ya está registrado")).toBeInTheDocument();
    expect(routerReplaceMock).not.toHaveBeenCalled();
  });
});
