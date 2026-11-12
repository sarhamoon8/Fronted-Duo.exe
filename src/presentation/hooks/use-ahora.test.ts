import { describe, expect, it, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAhora } from "./use-ahora";

describe("useAhora", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("se actualiza cada `ms` milisegundos", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useAhora(1000));
    const inicial = result.current;

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current).toBeGreaterThanOrEqual(inicial);
  });
});
