import { describe, expect, it } from "vitest";
import { esStaff } from "./rol";

describe("esStaff", () => {
  it("es true para FUNCIONARIO y ADMIN", () => {
    expect(esStaff("FUNCIONARIO")).toBe(true);
    expect(esStaff("ADMIN")).toBe(true);
  });

  it("es false para PACIENTE", () => {
    expect(esStaff("PACIENTE")).toBe(false);
  });
});
