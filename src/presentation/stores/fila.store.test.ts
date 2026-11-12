import { beforeEach, describe, expect, it } from "vitest";
import { useFilaStore } from "./fila.store";

describe("useFilaStore", () => {
  beforeEach(() => {
    useFilaStore.setState({
      entidadId: "",
      puntoId: "",
      servicioId: "",
      ventanillaId: "",
      autoActualizar: true,
    });
  });

  it("setEntidad limpia punto, servicio y ventanilla", () => {
    useFilaStore.getState().setPunto("p1");
    useFilaStore.getState().setServicio("s1");
    useFilaStore.getState().setVentanilla("v1");
    useFilaStore.getState().setEntidad("e1");

    expect(useFilaStore.getState()).toMatchObject({
      entidadId: "e1",
      puntoId: "",
      servicioId: "",
      ventanillaId: "",
    });
  });

  it("setPunto limpia la ventanilla", () => {
    useFilaStore.getState().setVentanilla("v1");
    useFilaStore.getState().setPunto("p2");
    expect(useFilaStore.getState().puntoId).toBe("p2");
    expect(useFilaStore.getState().ventanillaId).toBe("");
  });

  it("setServicio, setVentanilla y setAutoActualizar actualizan su propio campo", () => {
    useFilaStore.getState().setServicio("s9");
    useFilaStore.getState().setVentanilla("v9");
    useFilaStore.getState().setAutoActualizar(false);

    expect(useFilaStore.getState().servicioId).toBe("s9");
    expect(useFilaStore.getState().ventanillaId).toBe("v9");
    expect(useFilaStore.getState().autoActualizar).toBe(false);
  });
});
