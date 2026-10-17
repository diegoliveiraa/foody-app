import { act, renderHook, type RenderHookResult } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCountdown } from "./use-countdown";

const START: number = Date.UTC(2026, 9, 17, 12, 0, 0);

beforeEach((): void => {
  vi.useFakeTimers({ now: START });
});

afterEach((): void => {
  vi.useRealTimers();
});

describe("useCountdown", () => {
  it("counts down the whole seconds left until the given moment", () => {
    const { result }: RenderHookResult<number, unknown> = renderHook(() =>
      useCountdown(START + 5_000),
    );
    const atStart: number = result.current;

    act((): void => {
      vi.advanceTimersByTime(2_000);
    });

    expect(atStart).toBe(5);
    expect(result.current).toBe(3);
  });

  it("stops at zero once the moment has passed", () => {
    const { result }: RenderHookResult<number, unknown> = renderHook(() =>
      useCountdown(START + 1_500),
    );

    act((): void => {
      vi.advanceTimersByTime(4_000);
    });

    expect(result.current).toBe(0);
  });

  it("reads zero when there is nothing to wait for", () => {
    const { result }: RenderHookResult<number, unknown> = renderHook(() => useCountdown(null));

    expect(result.current).toBe(0);
  });
});
