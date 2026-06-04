# LazyLoad、Loading 与 Template

本页覆盖路由和加载占位相关的三个轻量组件：`LazyLoad`、`Loading`、`Template`。

## LazyLoad

`LazyLoad` 位于 `src/components/LazyLoad`。

### 职责

用 React `Suspense` 包裹一个传入的组件，并在异步组件加载期间展示统一的 `Loading`。`createLazyLoad` 是一个便捷函数，直接返回 `<LazyLoad ImportValue={ImportValue} />`。

### Props

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `ImportValue` | `any` | 是 | 无 | 被渲染的组件类型，通常是 `React.lazy(() => import(...))` 的结果。 |

无 ref/instance 方法。无内部状态。

### 事件流

1. `LazyLoad` 渲染 `<Suspense fallback={<Loading />}>`。
2. 在内部渲染 `<ImportValue />`。
3. 当 `ImportValue` 仍在加载时，React 展示 `Loading`。

### 依赖

- React：`Suspense`。
- 本地组件：`Loading`。

### 使用示例

```tsx
import { lazy } from "react";
import { createLazyLoad } from "@/components/LazyLoad";

{
  path: "/list",
  element: createLazyLoad(lazy(() => import("@/pages/list/App"))),
}
```

### 注意事项与边界条件

- `ImportValue` 必须是可作为 JSX 组件使用的值；如果传入 Promise 或模块对象本身会渲染失败。
- `createLazyLoad` 返回的是 React element，不是组件工厂。
- `LazyLoad` 不接收并不会向 `ImportValue` 透传额外 props。
- fallback 固定为 `<Loading />`，当前没有配置入口。

## Loading

`Loading` 位于 `src/components/Loading.tsx`。

### 职责

提供一个占满父容器的居中加载态。内部使用 Ant Design `Spin` 和 `LoadingOutlined`。

### Props 与状态

`Loading` 不接收 props，无 ref/instance 方法，无内部状态。

### 渲染结构

- 根节点是行内 style 的 `div`。
- 宽高均为 `100%`。
- 使用 flex 居中。
- `Spin` 的 `indicator` 使用 `LoadingOutlined`，图标字号为 `24`，并启用旋转状态。

### 依赖

- Ant Design：`Spin`。
- Ant Design Icons：`LoadingOutlined`。

### 使用示例

```tsx
<div style={{ height: 240 }}>
  <Loading />
</div>
```

### 注意事项

- 根节点高度是 `100%`，父容器需要有明确高度，否则视觉上可能没有可居中的空间。
- 组件没有文案、尺寸、颜色等配置。

## Template

`Template` 位于 `src/components/Template`。

### 职责

渲染 React Router 的 `<Outlet />`，作为自动路由树里的中间层占位组件。当前 `src/router/autoRoutes.tsx` 在创建中间路由节点时使用 `element: <Template />`。

### Props 与状态

`Template` 不接收 props，无 ref/instance 方法，无内部状态。

### 依赖

- React Router：`Outlet`。当前文件依赖自动导入或全局类型配置，源码中没有显式 import。

### 使用示例

```tsx
{
  path: "system",
  element: <Template />,
  children: [
    { path: "user", element: <UserPage /> },
  ],
}
```

### 注意事项

- 组件只返回 `<Outlet />`，不提供布局、权限、loading 或错误边界。
- 如果项目关闭 React Router 相关自动导入，需要补充 `Outlet` import；本文档只描述当前实现，不修改源码。
