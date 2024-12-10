import { useMatchRoutes } from "../../PermissionRouter";

export function useActive(activeCallBack?: () => any) {
  const matchRoutes = useMatchRoutes();
  const route = useMemo(() => matchRoutes.at(-1)?.route, [matchRoutes]);
  const initPath = useRef<string>();

  useEffect(() => {
    if (!initPath.current) {
      initPath.current = route?.fullPath;
      return;
    }
    if (initPath.current !== route?.fullPath) return;
    activeCallBack?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route?.fullPath]);
}
