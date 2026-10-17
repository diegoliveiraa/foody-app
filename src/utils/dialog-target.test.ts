import { describe, expect, it } from "vitest";
import { closeTarget, withClosed, withTargetError } from "./dialog-target";

interface Target {
  name: string;
  open: boolean;
  error?: string;
}

const OPEN: Target = { name: "Smash duplo", open: true };

describe("dialog target", () => {
  it("closes a dialog keeping what it showed, so it can animate out", () => {
    expect(withClosed(OPEN)).toEqual({ name: "Smash duplo", open: false });
    expect(closeTarget(OPEN)).toEqual({ name: "Smash duplo", open: false });
  });

  it("leaves no target when there was none", () => {
    expect(closeTarget<Target>(null)).toBeNull();
    expect(withTargetError<Target>("Em uso")(null)).toBeNull();
  });

  it("keeps the dialog open with the reason it could not go on", () => {
    expect(withTargetError<Target>("Em uso")(OPEN)).toEqual({ ...OPEN, error: "Em uso" });
  });
});
