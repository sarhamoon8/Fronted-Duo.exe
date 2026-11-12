import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMontado } from "./use-montado";

describe("useMontado", () => {
  it("devuelve true una vez montado en el cliente", () => {
    const { result } = renderHook(() => useMontado());
    expect(result.current).toBe(true);
  });
});
