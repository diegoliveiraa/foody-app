export interface OpenableTarget {
  open: boolean;
}

export function withClosed<T extends OpenableTarget>(target: T): T {
  return { ...target, open: false };
}

export function closeTarget<T extends OpenableTarget>(target: T | null): T | null {
  return target === null ? null : withClosed(target);
}

export function withTargetError<T extends OpenableTarget & { error?: string }>(
  error: string,
): (target: T | null) => T | null {
  return (target: T | null): T | null => (target === null ? null : { ...target, error });
}
