import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BotonGoogle } from "./boton-google";

function responderConfig(clientId: string | null, ok = true) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok, json: async () => ({ clientId }) }));
}

describe("BotonGoogle", () => {
  beforeEach(() => {
    delete window.google;
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sin Client ID muestra un botón que avisa que no está disponible", async () => {
    responderConfig(null);
    const alNoDisponible = vi.fn();
    render(<BotonGoogle onCredential={vi.fn()} onNoDisponible={alNoDisponible} />);

    const boton = await screen.findByRole("button", { name: /continuar con google/i });
    await waitFor(() => expect(boton).toBeEnabled());
    await userEvent.click(boton);

    expect(alNoDisponible).toHaveBeenCalledTimes(1);
  });

  it("si la configuración falla, se comporta como no configurado", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("sin red")));
    render(<BotonGoogle onCredential={vi.fn()} onNoDisponible={vi.fn()} />);

    const boton = await screen.findByRole("button", { name: /continuar con google/i });

    await waitFor(() => expect(boton).toBeEnabled());
  });

  it("con Client ID pinta el botón oficial de Google y entrega el token", async () => {
    responderConfig("123-abc.apps.googleusercontent.com");
    const initialize = vi.fn();
    const renderButton = vi.fn();
    window.google = { accounts: { id: { initialize, renderButton } } };
    const alRecibir = vi.fn();
    render(<BotonGoogle onCredential={alRecibir} onNoDisponible={vi.fn()} />);

    await waitFor(() => expect(renderButton).toHaveBeenCalledTimes(1));

    expect(initialize).toHaveBeenCalledWith(expect.objectContaining({ client_id: "123-abc.apps.googleusercontent.com" }));
    expect(renderButton).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ text: "continue_with", locale: "es" }),
    );
    expect(screen.getByRole("group", { name: /continuar con google/i })).toBeInTheDocument();

    // Google llama al callback cuando la persona elige su cuenta.
    (initialize.mock.calls[0]![0] as { callback: (r: { credential: string }) => void }).callback({ credential: "token-de-google" });
    expect(alRecibir).toHaveBeenCalledWith("token-de-google");
  });
});
