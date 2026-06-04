# 路由与布局

## 路由入口

主路由入口位于 `src/router/index.tsx`：

```ts
import { createHashRouter } from "react-router-dom";
import routes from "./autoRoutes";

const router = createHashRouter(routes as any);
export default router;
```

工程使用 hash router。URL hash 之后的路径参与前端匹配，适合静态部署或后端无法统一回退到 HTML 的场景。

当前 `src/router/index.tsx` 默认引用 `autoRoutes`。仓库同时保留 `src/router/routes.tsx` 手写路由，两者都经过 `formatRoutes` 处理：

| 文件 | 用途 | 当前行为 |
| --- | --- | --- |
| `src/router/autoRoutes.tsx` | 主路由当前入口 | 自动扫描 `@/pages/**/App.tsx`，基于目录生成路由树。 |
| `src/router/routes.tsx` | 手写路由配置 | 明确声明 `/`、布局节点、`/list` 和 `*` 兜底。 |
| `src/pages/list/router/index.tsx` | list 页面私有多页入口路由 | 页面入口 `src/pages/list/main.tsx` 使用，根路由重定向到 `/list`。 |

## CRouteObject 类型

自定义路由类型位于 `src/types/index.ts`：

```ts
export type CRouteObject = Omit<RouteObject, "children"> & {
  title?: string;
  hidden?: boolean;
  children?: CRouteObject[];
  redirect?: string;
  fullPath?: string;
  activePath?: string;
  roles?: string[];
  isMenuRoot?: boolean;
  keepAlive?: boolean;
};
```

`CRouteObject` 继承 React Router `RouteObject` 的全部字段，但把 `children` 改成递归的 `CRouteObject[]`。因此可用字段分两类：React Router 原生字段和工程扩展字段。

### React Router 原生字段

| 字段 | 类型 | 默认/来源 | 使用位置 | 影响 |
| --- | --- | --- | --- | --- |
| `path` | `string` | 必填或按 React Router 规则省略；当前路由大多显式配置。 | `createHashRouter`、`matchRoutes`、`formatRoutes`、菜单 `selectedKeys`、面包屑。 | 决定 URL 匹配。若以 `/` 开头，`formatRoutes` 将其视为绝对路径；否则与父路由拼接成 `fullPath`。 |
| `element` | `React.ReactNode` | 无默认值；由路由配置或自动路由生成。 | `createHashRouter` 渲染；`formatRoutes` 会根据 `redirect`/`roles` 包装。 | 决定匹配路由渲染的组件。带 `redirect` 时会被 `WrapRedirect` 包裹；带 `roles` 时会被 `PermissionRouter` 包裹。 |
| `children` | `CRouteObject[]` | 无默认值；自动路由会逐层创建。 | `createHashRouter`、`formatTree`、`MenuList`、`Breadcrumb`、`KeepAliveView`。 | 决定嵌套路由、菜单层级和面包屑匹配链。 |
| `index` | `boolean` | 当前源码未使用。 | React Router。 | 可声明 index route；使用时不能同时配置 `path`。 |
| `caseSensitive` | `boolean` | 当前源码未使用。 | React Router。 | 控制 `path` 匹配大小写敏感。 |
| `id` | `string` | 当前源码未使用。 | React Router data router。 | 可作为 route id 使用。 |
| `loader` | `LoaderFunction` | 当前源码未使用。 | React Router data router。 | 进入路由前加载数据。 |
| `action` | `ActionFunction` | 当前源码未使用。 | React Router data router。 | 处理 route action 提交。 |
| `errorElement` | `React.ReactNode` | 当前源码未使用。 | React Router。 | route 报错时渲染的错误元素。 |
| `hydrateFallbackElement` | `React.ReactNode` | 当前源码未使用。 | React Router。 | hydration fallback 元素。 |
| `shouldRevalidate` | `ShouldRevalidateFunction` | 当前源码未使用。 | React Router data router。 | 控制 loader/action 重新验证。 |
| `handle` | `unknown` | 当前源码未使用。 | React Router。 | 可挂载任意元信息；本工程使用自定义字段而不是 `handle`。 |
| `lazy` | `LazyRouteFunction` | 当前源码未使用。 | React Router。 | 可声明 route lazy；当前页面懒加载通过 `createLazyLoad(lazy(() => import(...)))` 放在 `element`。 |

### 工程扩展字段

| 字段 | 类型 | 默认/来源 | 使用位置 | 影响 |
| --- | --- | --- | --- | --- |
| `title` | `string` | 无默认值；自动路由取页面模块导出的 `title`，没有则取路径片段；手写 `/list` 为 `mock列表`。 | `MenuList`、`Breadcrumb`。 | 菜单 label 和面包屑文案。没有 `title` 的路由不进入面包屑展示，但仍可参与匹配。 |
| `hidden` | `boolean` | 默认 `undefined`，等价于不隐藏；自动路由取页面模块导出的 `hidden`。 | `MenuList.getItems`。 | `true` 时从侧栏菜单过滤，不影响路由访问、KeepAlive 或面包屑。 |
| `redirect` | `string` | 无默认值；手写路由和自动路由会在父节点设置首个子路径作为重定向。 | `formatRoutes`、`WrapRedirect`。 | `formatRoutes` 为带 `redirect` 的 route 包裹 `WrapRedirect`；进入该 route 后 `navigate(value, { replace: true })`。 |
| `fullPath` | `string` | `formatRoutes` 生成。 | `MenuList` key、`KeepAliveView` 缓存 key、`formatRoutes` 子路径拼接。 | 表示完整路径。绝对 `path` 直接使用；相对 `path` 通过父 `fullPath/path` 拼接，并压缩一次 `//`。 |
| `activePath` | `string` | 无默认值；自动路由取页面模块导出的 `activePath`。 | `MenuList`。 | 覆盖菜单选中项。匹配链中只要存在 `activePath`，`selectedKeys` 使用这些值，否则使用当前匹配路径。 |
| `roles` | `string[]` | 默认 `undefined` 或空数组；自动路由取页面模块导出的 `roles`。 | `formatRoutes`、`PermissionRouter`。 | 非空时路由元素被 `PermissionRouter` 包裹。当前 `authValidator` 固定返回 `true`，只打印 roles，尚未真正拦截。 |
| `isMenuRoot` | `boolean` | 默认 `undefined`；布局根路由设置为 `true`。 | `useMenuRoutes`。 | 标记侧栏菜单的根节点。`useMenuRoutes` 找到第一个 `isMenuRoot` 路由，并返回它的 `children`。 |
| `keepAlive` | `boolean` | 默认 `undefined`，等价于不缓存；自动路由创建页面时默认 `true`；手写 `/list` 为 `true`。 | `KeepAliveView`。 | `true` 且存在 `fullPath` 时，首次进入会把 outlet 缓存在 `KeepAliveContext.catchNodes[fullPath]`；后续通过 `hidden` 切换显示。 |

## 路由格式化

`src/router/utils.tsx` 的 `formatRoutes(routes)` 调用 `formatTree` 遍历路由树，对每个 route 做两件事：

1. 生成 `fullPath`：

```ts
fullPath: route.path?.startsWith("/")
  ? route.path
  : `${parent?.fullPath || parent?.path || ""}/${route.path}`.replace("//", "/")
```

2. 调用 `createElement(route)` 包装 `element`：

```ts
if (route.redirect) {
  element = <WrapRedirect>{element}</WrapRedirect>;
}
if (route.roles?.length) {
  element = <PermissionRouter>{element}</PermissionRouter>;
}
```

注意：`createElement` 读取的是格式化前的 `route`。`fullPath` 是写入返回的新 route 数据，用于后续菜单和 KeepAlive。

## 自动路由

`src/router/autoRoutes.tsx` 使用：

```ts
const list = import.meta.glob("@/pages/**/App.tsx", { eager: true });
```

对每个 `src/pages/<path>/App.tsx`：

- 取目录层级生成路由路径片段。
- 中间节点使用 `Template` 作为占位 element。
- 页面节点使用模块默认导出的组件作为 element。
- `title`、`hidden`、`roles`、`activePath` 从页面模块导出读取。
- 自动创建的 route 默认 `keepAlive: true`。
- 父节点如果还没有 `redirect`，会设置为第一个子路径。

当前 `src/pages/list/App.tsx` 没有导出 `title`、`hidden`、`roles` 或 `activePath`，因此自动路由中的 `/list` 标题会回退为路径片段 `list`。如果需要显示中文菜单标题，应在页面模块导出 `title`，或改用/同步手写路由。

## 当前手写路由

`src/router/routes.tsx` 中保留的手写路由如下：

| 路径 | 组件 | 扩展字段 | 说明 |
| --- | --- | --- | --- |
| `/` | `AppMain` | 无 | 顶层应用容器，内部渲染 `Outlet`。 |
| `/` | `LayoutPage` | `redirect: "/list"`、`isMenuRoot: true` | 布局节点，也是菜单根节点，进入后重定向到 `/list`。 |
| `/list` | `createLazyLoad(lazy(() => import("@/pages/list/App")))` | `title: "mock列表"`、`keepAlive: true` | mock 列表页，启用缓存。 |
| `*` | 无业务组件 | `redirect: "/"` | 兜底路径，匹配后重定向到根路径。 |

## 重定向

`WrapRedirect` 位于 `src/router/components/WrapRedirect.tsx`：

- 通过 `useRouter()` 读取当前 router。
- 使用 `matchRoutes(router.routes, Location.pathname)` 找到当前匹配链。
- 取最后一个匹配 route 的 `redirect`。
- 如果存在值，执行 `navigate(value, { replace: true })`。

因此 `redirect` 的生效点是进入被匹配 route 后的 effect，而不是 React Router 原生 `Navigate` 元素。

## 权限

`PermissionRouter` 位于 `src/router/components/PermissionRouter.tsx`。当路由配置 `roles` 为非空数组时，`formatRoutes` 会包裹它。

当前实现：

- 通过 `matchRoutes` 取最后一个匹配 route 的 `roles`。
- `authValidator` 打印 `roles`。
- 固定返回 `true`。

这意味着 `roles` 目前只是权限元信息和接入点，尚未根据用户身份做实际拦截。接入真实权限时，应替换 `authValidator`，并明确无权限时渲染空状态、跳转登录页或跳转 403 页。

## KeepAlive

KeepAlive 由三部分组成：

| 文件 | 职责 |
| --- | --- |
| `src/router/components/KeepAlive/context.tsx` | 提供 `KeepAliveContext`，维护 `catchNodes: Record<string, React.ReactNode>`，以及 `addCatchNode`、`removeNode`。 |
| `src/router/components/KeepAlive/index.tsx` | `KeepAliveView` 渲染当前 outlet，并按 `fullPath` 缓存 keepAlive 页面。 |
| `src/router/components/KeepAlive/hook/useActive.ts` | 页面重新切回初始 `fullPath` 时触发回调。 |

`KeepAliveView` 的规则：

- 当前 route 没有 `keepAlive` 时直接渲染 `outlet`。
- 当前 route 有 `keepAlive` 且有 `fullPath`，并且缓存中还没有该 key 时，将当前 `outlet` 写入 `catchNodes[fullPath]`。
- 所有缓存节点都会渲染为 `<div hidden={key !== route?.fullPath}>`，通过 `hidden` 控制显示。
- 缓存 key 是 `fullPath`，因此路由路径变更会影响缓存命中。

## 布局结构

布局组件位于 `src/layout/index.tsx`，使用 Ant Design `Layout`：

```text
LayoutPageStyled
  Layout.layout
    Sider.layout-sider-bar
      logo
      MenuList
    Layout
      Header.layout-header
        collapse Button
        Breadcrumb
        theme Radio.Group
      Layout.layout-content
        Content
          KeepAliveView
```

布局内部状态：

| 状态 | 类型 | 默认值 | 影响 |
| --- | --- | --- | --- |
| `collapsed` | `boolean` | `false` | 控制 Ant Design `Sider` 折叠；Logo 文案在 `V` 与 `Vite - React` 之间切换。 |
| `themeMode` | `"light" \| "dark"` | 来自 Redux theme slice | 控制菜单背景、布局样式和右上角主题按钮选中值。 |
| `antToken` | Ant Design token | 来自 `theme.useToken()` | 传给 `LayoutPageStyled` 生成边框、背景、滚动条颜色。 |
| `themeToken` | `ThemeToken` | 来自 `useToken()` | 传给 styled-components，当前包含 `headerBg`。 |

## 菜单

`src/layout/components/MenuList.tsx` 通过 `useMenuRoutes()` 获取菜单根节点的子路由：

- `useMenuRoutes` 从 `router.routes` 中查找 `isMenuRoot` 为 true 的 route。
- `getItems` 过滤 `hidden` 为 true 的路由。
- 菜单项 `label` 使用 `route.title`。
- 菜单项 `key` 使用 `route.fullPath`。
- 子菜单递归读取 `children`。

菜单选中逻辑：

- `activePaths` 来自当前匹配链中所有非空 `route.activePath`。
- 如果 `activePaths` 非空，`selectedKeys = activePaths`。
- 否则 `selectedKeys = matchRoutes.map(v => v.pathname)`。
- 点击菜单时执行 `navigate(selectedKeys[0])`。

## 面包屑

`src/layout/components/Breadcrumb.tsx` 使用 `matchRoutes(router.routes, pathname)` 获取当前匹配链：

- 过滤掉 `title === undefined` 的 route。
- 每一项 `key` 使用 `route.pathname`。
- 非最后一级渲染为 `<Link to={route.pathname}>title</Link>`。
- 最后一级渲染为普通 `<span>title</span>`。

面包屑只依赖 `title`，不依赖 `hidden`。因此隐藏菜单的页面仍可出现在面包屑中，只要 route 有 `title`。
