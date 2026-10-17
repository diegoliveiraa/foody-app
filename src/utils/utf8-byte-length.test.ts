import { describe, expect, it } from "vitest";
import { utf8ByteLength } from "./utf8-byte-length";

describe("utf8ByteLength", () => {
  it("counts one byte per ASCII character", () => {
    const bytes: number = utf8ByteLength("senha123");

    expect(bytes).toBe(8);
  });

  it("counts two bytes for an accented letter", () => {
    const bytes: number = utf8ByteLength("é");

    expect(bytes).toBe(2);
  });

  it("counts four bytes for an emoji, as the API's 72-byte password limit does", () => {
    const bytes: number = utf8ByteLength("🍔");

    expect(bytes).toBe(4);
  });
});
