export interface FakeViewport {
  resize(width: number): void;
}

type ChangeListener = (event: MediaQueryListEvent) => void;

const MAX_WIDTH_PATTERN: RegExp = /max-width:\s*(\d+)px/;

function matchesWidth(query: string, width: number): boolean {
  const maxWidth: number = Number(MAX_WIDTH_PATTERN.exec(query)?.[1] ?? Number.POSITIVE_INFINITY);
  return width <= maxWidth;
}

export function installFakeViewport(initialWidth: number): FakeViewport {
  let width: number = initialWidth;
  const listeners: Map<ChangeListener, string> = new Map<ChangeListener, string>();
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      get matches(): boolean {
        return matchesWidth(query, width);
      },
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: ChangeListener): void => {
        listeners.set(listener, query);
      },
      removeEventListener: (_type: string, listener: ChangeListener): void => {
        listeners.delete(listener);
      },
      addListener: (): void => {},
      removeListener: (): void => {},
      dispatchEvent: (): boolean => true,
    }) as MediaQueryList;
  return {
    resize(nextWidth: number): void {
      width = nextWidth;
      listeners.forEach((query: string, listener: ChangeListener): void =>
        listener({ matches: matchesWidth(query, width), media: query } as MediaQueryListEvent),
      );
    },
  };
}
