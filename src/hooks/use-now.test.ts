import { act, renderHook, type RenderHookResult } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useNow } from "./use-now";

const START: number = Date.UTC(2026, 9, 17, 22, 30, 0);

const SECOND_MS: number = 1_000;

const MINUTE_MS: number = 60_000;

beforeEach((): void => {
  vi.useFakeTimers({ now: START + 400 });
});

afterEach((): void => {
  vi.useRealTimers();
});

describe("useNow", () => {
  it("reads the current time, rounded down to the tick", () => {
    const { result }: RenderHookResult<number, unknown> = renderHook(() => useNow(SECOND_MS));

    expect(result.current).toBe(START);
  });

  it("moves forward on every tick without any effect", () => {
    const { result }: RenderHookResult<number, unknown> = renderHook(() => useNow(SECOND_MS));

    act((): void => {
      vi.advanceTimersByTime(2 * SECOND_MS);
    });

    expect(result.current).toBe(START + 2 * SECOND_MS);
  });

  it("stays on the same value until a whole tick has passed", () => {
    const { result }: RenderHookResult<number, unknown> = renderHook(() => useNow(MINUTE_MS));

    act((): void => {
      vi.advanceTimersByTime(30 * SECOND_MS);
    });

    expect(result.current).toBe(START);
  });
});
