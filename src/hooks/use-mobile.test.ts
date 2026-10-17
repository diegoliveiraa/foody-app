import { act, renderHook, type RenderHookResult } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { installFakeViewport, type FakeViewport } from "@/test/media";
import { useIsMobile } from "./use-mobile";

describe("useIsMobile", () => {
  it("reports a phone-sized viewport as mobile", () => {
    installFakeViewport(320);

    const { result }: RenderHookResult<boolean, unknown> = renderHook(useIsMobile);

    expect(result.current).toBe(true);
  });

  it("reports a viewport of 768px or more as not mobile", () => {
    installFakeViewport(768);

    const { result }: RenderHookResult<boolean, unknown> = renderHook(useIsMobile);

    expect(result.current).toBe(false);
  });

  it("follows the viewport when it crosses the breakpoint", () => {
    const viewport: FakeViewport = installFakeViewport(1280);
    const { result }: RenderHookResult<boolean, unknown> = renderHook(useIsMobile);

    act((): void => viewport.resize(375));

    expect(result.current).toBe(true);
  });
});
