import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppError } from "@/core/domain/errors";
import { useSesionStore } from "@/presentation/stores/sesion.store";

const routerReplaceMock = vi.fn();
const routerRefreshMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerReplaceMock, refresh: routerRefreshMock }),
  useSearchParams: () => new URLSearchParams(),
}));

const iniciarSesionMock = vi.fn();
vi.mock("@/infrastructure/container", () => ({
  casosDeUso: { iniciarSesion: { ejecutar: iniciarSesionMock } },
}));

const { LoginForm } = await import("./login-form");

describe("LoginForm", () => {
  beforeEach(() => {
    routerReplaceMock.mockReset();
    routerRefreshMock.mockReset();
    iniciarSesionMock.mockReset();
    useSesionStore.setState({ usuario: null, estado: "desconocido" });
  });

  it("muestra los errores de validación sin llamar al caso de uso si el formulario está vacío", async () => {
    const usuario = userEvent.setup();
    render(<LoginForm />);

    await usuario.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(await screen.findByText(/correo electrónico válido/i)).toBeInTheDocument();
    expect(iniciarSesionMock).not.toHaveBeenCalled();
  });

  it("inicia sesión, guarda al usuario en el store y redirige a /inicio por defecto", async () => {
    iniciarSesionMock.mockResolvedValue({
      id: "u1",
      nombre: "Ana",
      email: "ana@example.com",
      rol: "PACIENTE",
      expiraEn: null,
    });
    const usuario = userEvent.setup();
    render(<LoginForm />);

    await usuario.type(screen.getByLabelText(/correo electrónico/i), "ana@example.com");
    await usuario.type(screen.getByLabelText(/contraseña/i), "clave123");
    await usuario.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => expect(routerReplaceMock).toHaveBeenCalledWith("/inicio"));
    expect(useSesionStore.getState().usuario?.email).toBe("ana@example.com");
    expect(routerRefreshMock).toHaveBeenCalled();
  });

  it("muestra los mensajes del backend si las credenciales son rechazadas", async () => {
    iniciarSesionMock.mockRejectedValue(new AppError(["Credenciales inválidas"], 401));
    const usuario = userEvent.setup();
    render(<LoginForm />);

    await usuario.type(screen.getByLabelText(/correo electrónico/i), "ana@example.com");
    await usuario.type(screen.getByLabelText(/contraseña/i), "clave-incorrecta");
    await usuario.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(await screen.findByText("Credenciales inválidas")).toBeInTheDocument();
    expect(routerReplaceMock).not.toHaveBeenCalled();
  });
});
