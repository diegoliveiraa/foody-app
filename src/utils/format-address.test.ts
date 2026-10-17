import { describe, expect, it } from "vitest";
import type { DeliveryAddress } from "@/@types/orders";
import { formatAddress, type AddressLines } from "./format-address";

const PAULISTA: DeliveryAddress = {
  zipCode: "01310-100",
  street: "Avenida Paulista",
  number: "1000",
  complement: "Apto 42",
  neighborhood: "Bela Vista",
  city: "São Paulo",
  state: "SP",
};

describe("formatAddress", () => {
  it("writes the street line with the complement and the locality line with the CEP", () => {
    const lines: AddressLines = formatAddress(PAULISTA);

    expect(lines).toEqual({
      street: "Avenida Paulista, 1000 · Apto 42",
      locality: "Bela Vista, São Paulo - SP · 01310-100",
    });
  });

  it("leaves the complement out when there is none", () => {
    const lines: AddressLines = formatAddress({ ...PAULISTA, complement: null });

    expect(lines.street).toBe("Avenida Paulista, 1000");
  });
});
