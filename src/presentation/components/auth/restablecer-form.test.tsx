import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppError } from "@/core/domain/errors";

const restablecerMock = vi.fn();
vi.mock("@/infrastructure/container", () => ({
  casosDeUso: { restablecerPassword: { ejecutar: restablecerMock } },
}));

const { RestablecerForm } = await import("./restablecer-form");

const PASSWORD = "ClaveNueva1!";

async function llenar(password = PASSWORD, confirmacion = PASSWORD) {
  await userEvent.type(screen.getByLabelText(/^nueva contraseña$/i), password);
  await userEvent.type(screen.getByLabelText(/confirmar nueva contraseña/i), confirmacion);
}

describe("RestablecerForm", () => {
  beforeEach(() => {
    restablecerMock.mockReset();
  });

  it("sin token en el enlace avisa y ofrece pedir uno nuevo", () => {
    render(<RestablecerForm token={null} />);

    expect(screen.getByText("El enlace no es válido o ya venció")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Solicitar un enlace nuevo" })).toHaveAttribute("href", "/recuperar-contrasena");
    expect(screen.queryByLabelText(/^nueva contraseña$/i)).not.toBeInTheDocument();
  });

  it("muestra los dos campos, los requisitos y la casilla para mostrar las contraseñas", async () => {
    render(<RestablecerForm token="tok" />);

    expect(screen.getByText("Debe contener al menos:")).toBeInTheDocument();
    expect(screen.getByRole("list")).toHaveTextContent("Una letra mayúscula (pendiente)");
    const campo = screen.getByLabelText(/^nueva contraseña$/i);
    expect(campo).toHaveAttribute("type", "password");

    await userEvent.click(screen.getByLabelText(/mostrar contraseñas/i));
    expect(campo).toHaveAttribute("type", "text");
    expect(screen.getByLabelText(/confirmar nueva contraseña/i)).toHaveAttribute("type", "text");
  });

  it("marca los requisitos a medida que se escribe", async () => {
    render(<RestablecerForm token="tok" />);

    await userEvent.type(screen.getByLabelText(/^nueva contraseña$/i), "Clave1");

    expect(screen.getByRole("list")).toHaveTextContent("Una letra mayúscula (cumplido)");
    expect(screen.getByRole("list")).toHaveTextContent("Un símbolo especial: !, @ o # (pendiente)");
  });

  it("no envía si no cumple los requisitos o las contraseñas no coinciden", async () => {
    render(<RestablecerForm token="tok" />);

    await llenar("abc", "abd");
    await userEvent.click(screen.getByRole("button", { name: "Guardar nueva contraseña" }));

    expect(await screen.findByText(/la contraseña debe tener al menos 8 caracteres/i)).toBeInTheDocument();
    expect(screen.getByText("Las contraseñas no coinciden.")).toBeInTheDocument();
    expect(restablecerMock).not.toHaveBeenCalled();
  });

  it("guarda la contraseña nueva con el token y ofrece iniciar sesión", async () => {
    restablecerMock.mockResolvedValue(undefined);
    render(<RestablecerForm token="tok-del-correo" />);

    await llenar();
    await userEvent.click(screen.getByRole("button", { name: "Guardar nueva contraseña" }));

    expect(restablecerMock).toHaveBeenCalledWith({ token: "tok-del-correo", password: PASSWORD, confirmacion: PASSWORD });
    expect(await screen.findByText("Tu contraseña se actualizó")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Iniciar sesión" })).toHaveAttribute("href", "/login");
  });

  it("si el enlace venció o ya se usó, lo dice y ofrece pedir otro", async () => {
    restablecerMock.mockRejectedValue(new AppError(["El enlace no es válido o ya venció. Solicita uno nuevo."], 400));
    render(<RestablecerForm token="tok" />);

    await llenar();
    await userEvent.click(screen.getByRole("button", { name: "Guardar nueva contraseña" }));

    expect(await screen.findByText("El enlace no es válido o ya venció")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Solicitar un enlace nuevo" })).toBeInTheDocument();
  });

  it("muestra otros errores del servidor sin descartar el formulario", async () => {
    restablecerMock.mockRejectedValue(new AppError(["No hay conexión con el servidor."], 0, "red"));
    render(<RestablecerForm token="tok" />);

    await llenar();
    await userEvent.click(screen.getByRole("button", { name: "Guardar nueva contraseña" }));

    expect(await screen.findByText("No hay conexión con el servidor.")).toBeInTheDocument();
    expect(screen.getByLabelText(/^nueva contraseña$/i)).toBeInTheDocument();
  });
});
