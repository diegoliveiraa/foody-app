import { describe, expect, it } from "vitest";
import { serializeSearchParams } from "./search-params";

describe("serializeSearchParams", () => {
  it("writes each value as a query parameter", () => {
    const query: string = serializeSearchParams({ search: "ana", page: 2 });

    expect(query).toBe("search=ana&page=2");
  });

  it("leaves out parameters without a value", () => {
    const query: string = serializeSearchParams({ search: undefined, role: null, page: 1 });

    expect(query).toBe("page=1");
  });

  it("repeats a parameter for each item of a list", () => {
    const query: string = serializeSearchParams({ sort: ["name,asc", "email,desc"] });

    expect(new URLSearchParams(query).getAll("sort")).toEqual(["name,asc", "email,desc"]);
  });

  it("keeps falsy values that are values, such as zero and false", () => {
    const query: string = serializeSearchParams({ page: 0, active: false });

    expect(query).toBe("page=0&active=false");
  });

  it("encodes reserved characters", () => {
    const query: string = serializeSearchParams({ search: "ana & bruno" });

    expect(new URLSearchParams(query).get("search")).toBe("ana & bruno");
    expect(query).not.toContain(" ");
  });
});
