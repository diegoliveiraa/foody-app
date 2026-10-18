import { render, type RenderResult } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DocumentTitle } from "./index";

describe("DocumentTitle", () => {
  it("names the browser tab after the page, followed by the app", () => {
    render(<DocumentTitle label="Pedidos" />);

    expect(document.title).toBe("Pedidos · Foody");
  });

  it("names the tab after the app alone while the page has no name yet", () => {
    render(<DocumentTitle />);

    expect(document.title).toBe("Foody");
  });

  it("follows the page when its name changes", () => {
    const { rerender }: RenderResult = render(<DocumentTitle label="Pedidos" />);

    rerender(<DocumentTitle label="Pedido #1101" />);

    expect(document.title).toBe("Pedido #1101 · Foody");
  });
});
