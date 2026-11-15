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
  await usuario.type(screen.getByLabelText(/^contraseña$/i), "Clave123!");
  await usuario.click(screen.getByLabelText(/acepto los términos de uso/i));
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

  it("marca cada requisito de la contraseña a medida que se cumple", async () => {
    const usuario = userEvent.setup();
    render(<RegistroForm />);
    const requisitos = screen.getByRole("list");
    expect(requisitos).toHaveTextContent("Una letra mayúscula (pendiente)");

    await usuario.type(screen.getByLabelText(/^contraseña$/i), "Clave");

    expect(requisitos).toHaveTextContent("Una letra mayúscula (cumplido)");
    expect(requisitos).toHaveTextContent("Una letra minúscula (cumplido)");
    expect(requisitos).toHaveTextContent("8 caracteres (pendiente)");
    expect(requisitos).toHaveTextContent("Un número (pendiente)");
    expect(requisitos).toHaveTextContent("Un símbolo especial: !, @ o # (pendiente)");
  });

  it("no registra una contraseña que incumple los requisitos", async () => {
    const usuario = userEvent.setup();
    render(<RegistroForm />);

    await llenarFormularioValido(usuario);
    await usuario.clear(screen.getByLabelText(/^contraseña$/i));
    await usuario.type(screen.getByLabelText(/^contraseña$/i), "clave");
    await usuario.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(await screen.findByText(/la contraseña debe tener al menos 8 caracteres/i)).toBeInTheDocument();
    expect(registrarseMock).not.toHaveBeenCalled();
  });

  it("alterna entre ocultar y mostrar la contraseña", async () => {
    const usuario = userEvent.setup();
    render(<RegistroForm />);
    const campo = screen.getByLabelText(/^contraseña$/i);
    expect(campo).toHaveAttribute("type", "password");

    await usuario.click(screen.getByLabelText(/mostrar contraseña/i));
    expect(campo).toHaveAttribute("type", "text");

    await usuario.click(screen.getByLabelText(/mostrar contraseña/i));
    expect(campo).toHaveAttribute("type", "password");
  });

  it("exige aceptar los términos antes de registrar", async () => {
    const usuario = userEvent.setup();
    render(<RegistroForm />);

    await llenarFormularioValido(usuario);
    await usuario.click(screen.getByLabelText(/acepto los términos de uso/i));
    await usuario.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(await screen.findByText(/debes aceptar los términos de uso/i)).toBeInTheDocument();
    expect(registrarseMock).not.toHaveBeenCalled();
  });

  it("envía la aceptación de términos al registrar", async () => {
    registrarseMock.mockResolvedValue({ id: "u1", nombre: "Ana", email: "ana@example.com", rol: "PACIENTE", expiraEn: null });
    const usuario = userEvent.setup();
    render(<RegistroForm />);

    await llenarFormularioValido(usuario);
    await usuario.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(registrarseMock).toHaveBeenCalledWith(expect.objectContaining({ aceptaTerminos: true, password: "Clave123!" }));
  });

  it("enlaza los términos de uso y la política de privacidad", () => {
    render(<RegistroForm />);

    expect(screen.getByRole("link", { name: "Términos de uso" })).toHaveAttribute("href", "/terminos");
    expect(screen.getByRole("link", { name: "Política de privacidad" })).toHaveAttribute("href", "/privacidad");
  });

  it("ofrece continuar con Google y avisa que aún no está disponible", async () => {
    const usuario = userEvent.setup();
    render(<RegistroForm />);

    await usuario.click(screen.getByRole("button", { name: /continuar con google/i }));

    expect(screen.getByText(/estará disponible pronto/i)).toBeInTheDocument();
    expect(registrarseMock).not.toHaveBeenCalled();
  });

  it("permite volver a iniciar sesión", () => {
    render(<RegistroForm />);

    expect(screen.getByRole("link", { name: /volver a iniciar sesión/i })).toHaveAttribute("href", "/login");
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
