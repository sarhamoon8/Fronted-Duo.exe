import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo } from "./logo";

describe("Logo", () => {
  it("muestra el nombre y el lema por defecto", () => {
    render(<Logo />);
    expect(screen.getByText("FilaCero")).toBeInTheDocument();
    expect(screen.getByText("Salud sin filas")).toBeInTheDocument();
  });

  it("oculta el lema en modo compacto", () => {
    render(<Logo compacto />);
    expect(screen.getByText("FilaCero")).toBeInTheDocument();
    expect(screen.queryByText("Salud sin filas")).not.toBeInTheDocument();
  });
});
