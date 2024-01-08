import type { DependencyList } from "react";
import { useEffect, useRef } from "react";

export default function useInit(
  callback: (...args: any[]) => any,
  deps: DependencyList,
  customValidate?: () => boolean | undefined
) {
  const initRef = useRef<boolean>(true);

  useEffect(() => {
    if (initRef.current) {
      if (!customValidate || customValidate?.()) {
        initRef.current = false;
      }
      return;
    }
    callback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function useOnce(
  callback: (...args: any[]) => any,
  deps: DependencyList,
  customValidate?: () => boolean
) {
  const initRef = useRef<boolean>(false);

  useEffect(() => {
    if (initRef.current) return;
    if (customValidate && !customValidate()) return;

    initRef.current = true;
    callback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
