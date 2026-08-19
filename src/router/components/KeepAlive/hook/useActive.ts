import { useMatchRoutes } from "../../PermissionRouter";

export function useActive(activeCallBack?: () => any) {
  const matchRoutes = useMatchRoutes();
  const route = useMemo(() => matchRoutes.at(-1)?.route, [matchRoutes]);
  const initPathRef = useRef<string>(null);

  useEffect(() => {
    if (!initPathRef.current) {
      initPathRef.current = route?.fullPath || null;
      return;
    }
    if (initPathRef.current !== route?.fullPath) return;
    activeCallBack?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route?.fullPath]);
}
