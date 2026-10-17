import { act, renderHook, type RenderHookResult } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebouncedValue } from "./use-debounced-value";

const DELAY_MS: number = 500;

interface DebounceProps {
  value: string;
}

function renderDebounced(value: string): RenderHookResult<string, DebounceProps> {
  return renderHook(
    ({ value: current }: DebounceProps): string => useDebouncedValue(current, DELAY_MS),
    { initialProps: { value } },
  );
}

beforeEach((): void => {
  vi.useFakeTimers();
});

afterEach((): void => {
  vi.useRealTimers();
});

describe("useDebouncedValue", () => {
  it("returns the first value at once", () => {
    const { result }: RenderHookResult<string, DebounceProps> = renderDebounced("ana");

    expect(result.current).toBe("ana");
  });

  it("keeps the previous value until the delay has passed without changes", () => {
    const { result, rerender }: RenderHookResult<string, DebounceProps> = renderDebounced("");

    rerender({ value: "ana" });
    act((): void => {
      vi.advanceTimersByTime(DELAY_MS - 1);
    });
    const beforeDelay: string = result.current;
    act((): void => {
      vi.advanceTimersByTime(1);
    });

    expect(beforeDelay).toBe("");
    expect(result.current).toBe("ana");
  });

  it("restarts the wait on every change and settles on the last value", () => {
    const { result, rerender }: RenderHookResult<string, DebounceProps> = renderDebounced("");

    rerender({ value: "a" });
    act((): void => {
      vi.advanceTimersByTime(DELAY_MS - 100);
    });
    rerender({ value: "an" });
    act((): void => {
      vi.advanceTimersByTime(DELAY_MS - 100);
    });
    const whileTyping: string = result.current;
    act((): void => {
      vi.advanceTimersByTime(100);
    });

    expect(whileTyping).toBe("");
    expect(result.current).toBe("an");
  });
});
