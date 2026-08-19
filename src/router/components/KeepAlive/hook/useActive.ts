import { useMatchRoutes } from "../../PermissionRouter";

const UNINITIALIZED = Symbol("useActive.uninitialized");

function reportCallbackError(error: unknown) {
  console.error("[useActive] 激活回调执行失败。", error);
}

export function useActive(activeCallback?: () => void | Promise<void>) {
  const matchRoutes = useMatchRoutes();
  const fullPath = matchRoutes.at(-1)?.route.fullPath;
  const initialPathRef = useRef<string | typeof UNINITIALIZED>(UNINITIALIZED);
  const wasActiveRef = useRef(false);

  useLayoutEffect(() => {
    if (initialPathRef.current === UNINITIALIZED) {
      if (fullPath === undefined) return;

      initialPathRef.current = fullPath;
      wasActiveRef.current = true;
      return;
    }

    const isActive = initialPathRef.current === fullPath;
    const shouldNotify = isActive && !wasActiveRef.current;
    wasActiveRef.current = isActive;

    if (!shouldNotify || !activeCallback) return;

    try {
      void Promise.resolve(activeCallback()).catch(reportCallbackError);
    } catch (error) {
      reportCallbackError(error);
    }
  }, [activeCallback, fullPath]);
}
