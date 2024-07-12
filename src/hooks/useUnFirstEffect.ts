import { useEffect, useRef } from "react";

export default function useUnFirstEffect(
  cb: Parameters<typeof useEffect>[0],
  deps: Parameters<typeof useEffect>[1],
) {
  const initRef = useRef<boolean>(true);

  useEffect(() => {
    if (initRef.current) {
      initRef.current = false;
      return;
    }
    cb();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
