# useConfigurableEffect

源码路径：`src/hooks/useConfigurableEffect.ts`

`useConfigurableEffect` 在 `useEffect` 基础上统一控制首次挂载、执行次数和 React Router 路由 state 的一次性消费。

## 类型

```ts
interface UseConfigurableEffectOptions {
  runOnMount?: boolean;
  once?: boolean;
  consumeRouteState?: boolean;
}

function useConfigurableEffect<T = unknown>(
  callback: (routeState?: T) => void | (() => void),
  deps: DependencyList | undefined,
  options?: UseConfigurableEffectOptions,
): void;
```

## 配置

| 配置                | 默认值  | 说明                                                                         |
| ------------------- | ------- | ---------------------------------------------------------------------------- |
| `runOnMount`        | `true`  | 是否在组件首次挂载时执行 callback。为 `false` 时，依赖后续变化才执行。       |
| `once`              | `false` | callback 是否最多执行一次。                                                  |
| `consumeRouteState` | `false` | 执行 callback 时读取 `history.state.usr` 并作为参数传入，之后将 `usr` 清空。 |

callback 的清理函数会返回给 React，并按 `useEffect` 的规则执行。调用方仍需保证 `deps` 完整，并保持配置语义在组件生命周期内一致。

## 示例

跳过首次执行：

```ts
useConfigurableEffect(
  () => {
    form.resetFields();
  },
  [form, open],
  { runOnMount: false },
);
```

只消费一次页面跳转 state：

```ts
useConfigurableEffect<{ fromCreate?: boolean }>(
  state => {
    if (state?.fromCreate) api.doSearch(searchParams);
  },
  undefined,
  { once: true, consumeRouteState: true },
);
```

`consumeRouteState` 延续 React Router 浏览器 history 的 `usr` 存储约定；callback 抛错时不会执行后续清理。
