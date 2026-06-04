# Template

源码路径：`src/components/Template/index.tsx`

`Template` 是自动路由中的中间层占位组件，只渲染 React Router 的 `Outlet`。

## 类型

```ts
const Template: () => JSX.Element;
```

不接收 props，无 ref、无内部状态。

## 实现

```tsx
const Template = () => {
  return <Outlet />;
};
```

当前文件没有显式 import `Outlet`，依赖 `vite.config.ts` 中 `AutoImport` 对 `react-router-dom` 的自动导入。

## 使用位置

`src/router/autoRoutes.tsx` 创建中间路由节点时：

```ts
const createRoute = (pageData: Record<string, any>, path: string): CRouteObject => ({
  path,
  title: pageData.title || path,
  hidden: pageData.hidden,
  roles: pageData.roles,
  keepAlive: true,
  activePath: pageData.activePath,
  element: <Template />,
});
```

页面叶子节点会把 `element` 替换为页面默认导出的组件。

## 边界条件

- 只提供嵌套路由出口，不提供布局、权限、loading 或错误边界。
- 如果关闭自动导入，需要在源码中显式引入 `Outlet`。
- 中间节点默认 `keepAlive: true`，最终行为仍取决于格式化后的路由和 `KeepAliveView`。
