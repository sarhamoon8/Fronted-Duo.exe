import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

describe("Button", () => {
  it("dispara onClick al hacer clic", async () => {
    const onClick = vi.fn();
    const usuario = userEvent.setup();
    render(<Button onClick={onClick}>Guardar</Button>);

    await usuario.click(screen.getByRole("button", { name: "Guardar" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("se deshabilita y marca aria-busy mientras cargando=true, sin disparar onClick", async () => {
    const onClick = vi.fn();
    const usuario = userEvent.setup();
    render(
      <Button onClick={onClick} cargando>
        Guardar
      </Button>,
    );

    const boton = screen.getByRole("button", { name: "Guardar" });
    expect(boton).toBeDisabled();
    expect(boton).toHaveAttribute("aria-busy", "true");

    await usuario.click(boton);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("type por defecto es 'button' (no envía formularios por accidente)", () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });
});
