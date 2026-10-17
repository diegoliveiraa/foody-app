import { renderHook, type RenderHookResult } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { problem } from "@/test/problems";
import { useNotifyError } from "./use-notify-error";

type ToastMock = Mock & { error: Mock };

const toast: ToastMock = vi.hoisted((): ToastMock => Object.assign(vi.fn(), { error: vi.fn() }));

vi.mock("sonner", () => ({ toast }));

function renderNotify(): RenderHookResult<(error: unknown) => void, unknown> {
  return renderHook(useNotifyError);
}

beforeEach((): void => {
  vi.clearAllMocks();
});

describe("useNotifyError", () => {
  it("shows the API's detail in an error toast", () => {
    const { result }: RenderHookResult<(error: unknown) => void, unknown> = renderNotify();

    result.current({ status: 409, data: problem(409, "CONFLICT", "Já existe") });

    expect(toast.error).toHaveBeenCalledWith("Já existe");
  });

  it("leaves a rate-limited refusal to the app-wide notice", () => {
    const { result }: RenderHookResult<(error: unknown) => void, unknown> = renderNotify();

    result.current({ status: 429, data: problem(429, "RATE_LIMITED") });

    expect(toast.error).not.toHaveBeenCalled();
  });

  it("keeps the same function across renders", () => {
    const { result, rerender }: RenderHookResult<(error: unknown) => void, unknown> =
      renderNotify();
    const first: (error: unknown) => void = result.current;

    rerender();

    expect(result.current).toBe(first);
  });
});
