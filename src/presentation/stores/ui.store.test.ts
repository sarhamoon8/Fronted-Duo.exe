import { beforeEach, describe, expect, it } from "vitest";
import { useUiStore } from "./ui.store";

describe("useUiStore", () => {
  beforeEach(() => {
    useUiStore.setState({ perfilAbierto: false });
  });

  it("abrirPerfil y cerrarPerfil cambian perfilAbierto", () => {
    useUiStore.getState().abrirPerfil();
    expect(useUiStore.getState().perfilAbierto).toBe(true);

    useUiStore.getState().cerrarPerfil();
    expect(useUiStore.getState().perfilAbierto).toBe(false);
  });
});
