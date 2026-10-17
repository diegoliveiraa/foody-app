import type { DeliveryAddress } from "@/@types/orders";
import { MESSAGES } from "@/constants/messages";

export interface AddressLines {
  street: string;
  locality: string;
}

function joinParts(parts: readonly (string | null | undefined)[]): string {
  return parts
    .filter((part: string | null | undefined): part is string => Boolean(part))
    .join(MESSAGES.ORDERS.ADDRESS_SEPARATOR);
}

export function formatAddress(address: DeliveryAddress): AddressLines {
  return {
    street: joinParts([
      MESSAGES.ORDERS.STREET_LINE(address.street, address.number),
      address.complement,
    ]),
    locality: joinParts([
      MESSAGES.ORDERS.CITY_LINE(address.neighborhood, address.city, address.state),
      address.zipCode,
    ]),
  };
}
