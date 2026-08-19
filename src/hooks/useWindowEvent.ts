export function useWindowEvent<T extends keyof WindowEventMap>(
  name: T,
  callback: (event: WindowEventMap[T]) => void,
) {
  useEffect(() => {
    window.addEventListener(name, callback);

    return () => {
      window.removeEventListener(name, callback);
    };
  }, [callback, name]);
}
