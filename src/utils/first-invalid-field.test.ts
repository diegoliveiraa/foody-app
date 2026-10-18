import type { FieldErrors } from "react-hook-form";
import { describe, expect, it } from "vitest";
import { firstInvalidField } from "./first-invalid-field";

interface AddressValues {
  address: { zipCode: string; street: string; state: string };
}

type AddressField = "address.zipCode" | "address.street" | "address.state";

const VISUAL_ORDER: readonly AddressField[] = [
  "address.zipCode",
  "address.street",
  "address.state",
];

describe("firstInvalidField", () => {
  it("picks the first field in the given order that has an error, whatever order the errors came in", () => {
    const errors: FieldErrors<AddressValues> = {
      address: {
        state: { type: "custom", message: "Escolha a UF" },
        street: { type: "custom", message: "Informe a rua" },
        zipCode: { type: "custom", message: "Informe o CEP" },
      },
    };

    const field: AddressField | undefined = firstInvalidField(errors, VISUAL_ORDER);

    expect(field).toBe("address.zipCode");
  });

  it("picks a later field when it is the only one with an error", () => {
    const errors: FieldErrors<AddressValues> = {
      address: { state: { type: "custom", message: "Escolha a UF" } },
    };

    const field: AddressField | undefined = firstInvalidField(errors, VISUAL_ORDER);

    expect(field).toBe("address.state");
  });

  it("picks nothing when no field has an error", () => {
    const field: AddressField | undefined = firstInvalidField({}, VISUAL_ORDER);

    expect(field).toBeUndefined();
  });
});
