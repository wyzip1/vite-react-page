import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useOnceState(callback: (v: any) => any) {
  const Location = useLocation();
  useEffect(() => {
    callback(Location.state);
    window.history.replaceState({ ...(window.history.state || {}), usr: null }, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
