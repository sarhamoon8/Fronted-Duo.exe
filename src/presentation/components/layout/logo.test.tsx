import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo, LogoCompleto, LogoInsignia } from "./logo";

describe("Logo", () => {
  it("muestra la imagen de la marca", () => {
    render(<Logo />);
    expect(screen.getByAltText("FilaCero")).toBeInTheDocument();
  });

  it("también se muestra en modo compacto", () => {
    render(<Logo compacto />);
    expect(screen.getByAltText("FilaCero")).toBeInTheDocument();
  });
});

describe("LogoInsignia", () => {
  it("muestra la imagen de la marca", () => {
    render(<LogoInsignia />);
    expect(screen.getByAltText("FilaCero")).toBeInTheDocument();
  });
});

describe("LogoCompleto", () => {
  it("muestra la imagen de la marca", () => {
    render(<LogoCompleto />);
    expect(screen.getByAltText("FilaCero")).toBeInTheDocument();
  });
});
