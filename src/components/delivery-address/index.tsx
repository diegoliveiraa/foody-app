import { cn } from "cn";
import { MapPin } from "lucide-react";
import type { JSX } from "react";
import type { DeliveryAddress as Address } from "@/@types/orders";
import { MESSAGES } from "@/constants/messages";
import { formatAddress, type AddressLines } from "@/utils/format-address";

interface DeliveryAddressProps {
  address: Address;
  className?: string;
}

export function DeliveryAddress({ address, className }: DeliveryAddressProps): JSX.Element {
  const lines: AddressLines = formatAddress(address);

  return (
    <div className={cn("flex items-start gap-3 text-sm", className)}>
      <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
      <address
        aria-label={MESSAGES.ORDERS.DELIVERY_ADDRESS}
        className="flex flex-col gap-0.5 not-italic"
      >
        <span className="font-semibold break-words">{lines.street}</span>
        <span className="break-words text-muted-foreground">{lines.locality}</span>
      </address>
    </div>
  );
}
