import type { DependencyList, EffectCallback } from "react";

export interface UseConfigurableEffectOptions {
  /** 是否在组件首次挂载时执行，默认执行。 */
  runOnMount?: boolean;
  /** callback 是否最多只执行一次，默认可随依赖变化重复执行。 */
  once?: boolean;
  /** 是否读取并消费 React Router 写入 history.state.usr 的路由 state。 */
  consumeRouteState?: boolean;
}

/**
 * 支持控制首次挂载、执行次数和路由 state 消费的 effect。
 */
export default function useConfigurableEffect<T = unknown>(
  callback: (routeState?: T) => ReturnType<EffectCallback>,
  deps: DependencyList | undefined,
  options: UseConfigurableEffectOptions = {},
) {
  const { runOnMount = true, once = false, consumeRouteState = false } = options;
  const isFirstRef = useRef(true);
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (isFirstRef.current) {
      isFirstRef.current = false;
      if (!runOnMount) return;
    }

    if (once && hasRunRef.current) return;

    hasRunRef.current = true;

    if (!consumeRouteState) return callback();

    const routeState = window.history.state?.usr as T | undefined;
    const cleanup = callback(routeState);
    window.history.replaceState({ ...(window.history.state || {}), usr: null }, "");
    return cleanup;
    // callback 和配置项与 deps 一样由调用方负责保持一致。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
