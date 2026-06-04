# useWindowEvent

源码路径：`src/hooks/useWindowEvent.ts`

`useWindowEvent` 用于注册 `window` 事件监听。当前实现不使用 `useEffect`，而是在 render 阶段移除上一次 callback 并注册新的 callback。

## 类型

```ts
function useWindowEvent<T extends keyof WindowEventMap>(
  name: T,
  callback: Parameters<typeof window.addEventListener<T>>[1],
): void
```

## 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `name` | `T extends keyof WindowEventMap` | 是 | 无 | window 事件名，如 `"resize"`、`"scroll"`、`"keydown"`。 |
| `callback` | `Parameters<typeof window.addEventListener<T>>[1]` | 是 | 无 | 事件回调，按事件名获得对应事件类型。 |

无返回值。

## 内部状态

| ref | 类型 | 初始值 | 说明 |
| --- | --- | --- | --- |
| `cbRef` | `useRef<Parameters<typeof window.addEventListener<T>>[1]>()` | `undefined` | 保存上一次注册的 callback。 |

## 执行流程

```text
组件 render
  -> 如果 cbRef.current 存在，window.removeEventListener(name, cbRef.current)
  -> cbRef.current = callback
  -> window.addEventListener(name, cbRef.current)
```

## 示例

```ts
useWindowEvent("resize", () => {
  console.log(window.innerWidth);
});
```

## 边界条件

- 没有卸载 cleanup，组件卸载后最后一次 listener 不会自动移除。
- 注册发生在 render 阶段，频繁 render 会频繁 remove/add。
- 如果 `name` 变化，源码会用新事件名移除旧 callback，旧事件名下的 listener 可能残留。
- 不支持 `addEventListener` options，例如 `capture`、`passive`、`once`。
- 直接访问 `window`，不适合 SSR。
