type EventMap<T extends EventTarget> = T extends Window
  ? WindowEventMap
  : T extends Document
    ? DocumentEventMap
    : T extends HTMLElement
      ? HTMLElementEventMap
      : Record<string, Event>;

export function useEventListener<
  T extends EventTarget = Window,
  K extends keyof EventMap<T> & string = keyof EventMap<T> & string,
>(name: K, callback: (event: EventMap<T>[K]) => void, element?: T | null) {
  useEffect(() => {
    const target = element === undefined ? window : element;
    if (!target) return;

    const listener = callback as EventListener;
    target.addEventListener(name, listener);

    return () => {
      target.removeEventListener(name, listener);
    };
  }, [callback, element, name]);
}
