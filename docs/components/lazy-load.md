# LazyLoad

源码路径：`src/components/LazyLoad/index.tsx`

`LazyLoad` 用 React `Suspense` 包裹异步组件，并在加载期间显示统一 `Loading`。

## 类型

```ts
const LazyLoad: React.FC<{ ImportValue: any }>;

export function createLazyLoad(ImportValue: any): React.ReactElement;
```

## Props

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `ImportValue` | `any` | 是 | 无 | 可作为 JSX 组件渲染的值，通常是 `React.lazy(() => import(...))` 的返回结果。 |

无 ref、无内部状态。

## 渲染结构

```tsx
<Suspense fallback={<Loading />}>
  <ImportValue />
</Suspense>
```

`createLazyLoad(ImportValue)` 直接返回：

```tsx
<LazyLoad ImportValue={ImportValue} />
```

## 示例

```tsx
{
  path: "/list",
  element: createLazyLoad(lazy(() => import("@/pages/list/App"))),
}
```

## 边界条件

- `ImportValue` 必须是组件类型；传入 Promise 或模块对象会渲染失败。
- `createLazyLoad` 返回 React element，不是组件工厂。
- 不向 `ImportValue` 透传额外 props。
- fallback 固定为 `Loading`，没有配置入口。
