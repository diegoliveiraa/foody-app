const ENCODER: TextEncoder = new TextEncoder();

export function utf8ByteLength(value: string): number {
  return ENCODER.encode(value).length;
}
