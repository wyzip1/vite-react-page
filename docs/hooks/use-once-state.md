# useOnceState

源码路径：`src/hooks/useOnceState.ts`

`useOnceState` 用于首次挂载时消费一次 React Router `location.state`，然后清空浏览器 history state 中的 `usr` 字段，避免后续重复消费。

## 类型

```ts
function useOnceState(callback: (v: any) => any): void
```

## 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `callback` | `(v: any) => any` | 是 | 无 | 接收 `Location.state`。返回值不会被使用。 |

无返回值。

## 生命周期

```text
组件挂载
  -> useLocation() 读取 Location
  -> useEffect 首次执行
  -> callback(Location.state)
  -> window.history.replaceState({ ...window.history.state, usr: null }, "")
```

effect 依赖数组为空，后续路由 state 变化不会再次触发。

## 示例

```ts
useOnceState(state => {
  if (state?.fromCreate) {
    api.doSearch();
  }
});
```

## 边界条件

- 依赖 React Router 把 location state 存在 `history.state.usr` 的约定。
- 只清空 `usr`，保留 `history.state` 的其他字段。
- 如果 `callback` 抛错，`replaceState` 不会执行。
- 直接访问 `window.history`，不适合 SSR。
- 只适合一次性跳转参数，不适合持续状态同步。
