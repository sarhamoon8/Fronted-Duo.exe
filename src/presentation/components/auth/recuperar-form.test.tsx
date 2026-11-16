import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppError } from "@/core/domain/errors";

const solicitarMock = vi.fn();
vi.mock("@/infrastructure/container", () => ({
  casosDeUso: { solicitarRecuperacion: { ejecutar: solicitarMock } },
}));

const { RecuperarForm } = await import("./recuperar-form");

describe("RecuperarForm", () => {
  beforeEach(() => {
    solicitarMock.mockReset();
  });

  it("muestra el campo, la nota de privacidad y el regreso al inicio de sesión", () => {
    render(<RecuperarForm />);

    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByText(/si hay una cuenta asociada a este correo/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar instrucciones" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /volver a iniciar sesión/i })).toHaveAttribute("href", "/login");
  });

  it("valida el correo sin llamar al caso de uso", async () => {
    render(<RecuperarForm />);

    await userEvent.type(screen.getByLabelText(/correo electrónico/i), "no-es-correo");
    await userEvent.click(screen.getByRole("button", { name: "Enviar instrucciones" }));

    expect(await screen.findByText(/correo electrónico válido/i)).toBeInTheDocument();
    expect(solicitarMock).not.toHaveBeenCalled();
  });

  it("pide el enlace y muestra la confirmación, sin decir si la cuenta existe", async () => {
    solicitarMock.mockResolvedValue(undefined);
    render(<RecuperarForm />);

    await userEvent.type(screen.getByLabelText(/correo electrónico/i), "ana@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Enviar instrucciones" }));

    expect(solicitarMock).toHaveBeenCalledWith("ana@example.com");
    expect(await screen.findByText("Revisa tu correo")).toBeInTheDocument();
    expect(screen.getByText(/si hay una cuenta asociada a/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Enviar instrucciones" })).not.toBeInTheDocument();
  });

  it("muestra el error si falla el envío", async () => {
    solicitarMock.mockRejectedValue(new AppError(["No hay conexión con el servidor."], 0, "red"));
    render(<RecuperarForm />);

    await userEvent.type(screen.getByLabelText(/correo electrónico/i), "ana@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Enviar instrucciones" }));

    expect(await screen.findByText("No hay conexión con el servidor.")).toBeInTheDocument();
    expect(screen.queryByText("Revisa tu correo")).not.toBeInTheDocument();
  });
});
