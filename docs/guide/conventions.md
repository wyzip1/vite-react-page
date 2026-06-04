# 开发约定

## 页面开发

页面建议放在 `src/pages/<page-name>` 下。一个页面模块可以包含：

| 文件 | 是否必需 | 说明 |
| --- | --- | --- |
| `App.tsx` | 是 | 页面主体组件，供主路由自动扫描或手写路由懒加载。 |
| `main.tsx` | 多页入口需要时 | 独立挂载页面，用于多页构建插件识别。 |
| `router/index.tsx` | 多页入口需要时 | 页面私有路由，通常用于该页面入口内部重定向和 KeepAlive。 |
| 其他组件/类型文件 | 按需 | 页面私有组件和类型，只有跨页面复用时才上提。 |

页面职责包括：

- 组织查询条件、表格、弹窗、按钮等业务组件。
- 维护页面级 state，例如筛选数据、当前编辑项和临时 UI 状态。
- 将接口入参整理成后端需要的结构。
- 处理保存、删除、刷新等业务动作。
- 通过导出 `title`、`hidden`、`roles`、`activePath` 等字段给自动路由读取。

可复用逻辑应下沉到 `components`、`hooks` 或 `utils`，避免页面文件过长。

## 路由约定

主路由当前从 `src/router/autoRoutes.tsx` 生成，手写配置在 `src/router/routes.tsx` 保留。新增页面时要确认使用哪种方式：

- 自动路由：新增 `src/pages/<path>/App.tsx` 即可被扫描，默认 `keepAlive: true`，标题默认使用路径片段。
- 手写路由：在 `src/router/routes.tsx` 中显式声明 `path`、`title`、`element`、`keepAlive` 等字段。

扩展字段约定：

| 字段 | 建议 |
| --- | --- |
| `title` | 菜单和面包屑需要展示时必须配置，自动路由下建议页面模块显式导出中文标题。 |
| `hidden` | 只影响菜单隐藏，不要用它做权限控制。 |
| `redirect` | 用于父级默认子页面或兜底页跳转，目标路径建议写完整路径。 |
| `activePath` | 详情页、编辑页等需要高亮父菜单时使用。 |
| `roles` | 当前只是权限接入点，真实拦截需要完善 `PermissionRouter`。 |
| `keepAlive` | 适合列表筛选和编辑态需要保留的页面；不适合数据必须每次重新初始化的页面。 |

## 组件开发

组件建议遵循以下边界：

- props 描述输入，不直接依赖具体页面接口。
- 内部状态只管理组件自身交互。
- 涉及异步行为时暴露明确回调，例如 `onChange`、`onSaveRecord`、`onConfirm`。
- 需要命令式调用时使用 `forwardRef` 和 `useImperativeHandle`，例如 `EditTable`。
- 类型靠近组件维护，例如 `src/components/EditTable/types.ts`、`src/components/Search/type.ts`。

## Hook 开发

hook 适合封装：

- 请求生命周期。
- 分页、刷新、重置等状态机。
- 弹窗挂载与命令式调用。
- 事件订阅和副作用控制。

hook 不建议直接返回 JSX。需要 UI 的场景应由组件负责渲染。

## API 开发

接口约定：

- 手写接口集中从 `src/api/index.ts` 导出。
- 请求实例复用 `src/api/config.ts` 的 `axiosInstance`。
- 接口返回类型优先使用 `RequestResponse<T>`。
- 分页列表数据优先使用 `List<T>` 和 `Pagination` 结构，方便接入 `useFetchList`。
- 生成接口放入 `src/api/generated`，不要手改生成产物。

mock 约定：

- mock 文件放在根目录 `mock` 下。
- 开发环境统一通过 `/developmentApi` 前缀访问。
- mock 响应结构保持 `{ code, message, data }`，否则会被响应拦截器当成异常或无法被页面正确读取。

## Utils 开发

utils 应保持低耦合：

- 优先写纯函数。
- 浏览器相关工具明确依赖 DOM、localStorage、clipboard 等 API。
- 涉及泛型路径的函数复用 `Path<T>` 类型，提升 `dataIndex`、`getValue`、`setValue` 的类型提示。

## 类型约定

共享类型放在 `src/types` 或对应模块的 `types.ts`。组件私有类型优先靠近组件，例如：

```text
src/components/EditTable/types.ts
src/components/Search/type.ts
```

当前全局类型：

| 类型 | 位置 | 说明 |
| --- | --- | --- |
| `SortType<T>` | `src/types/index.ts` | Ant Design 表格排序结果，支持单排序或多排序。 |
| `CRouteObject` | `src/types/index.ts` | 扩展 React Router `RouteObject`，增加菜单、重定向、权限和缓存字段。 |

## 文档同步

新增或变更以下内容时，应同步更新 `docs`：

- 新页面或页面主流程变化。
- 组件 props、ref、事件和默认行为变化。
- hook 返回值或调用约定变化。
- utils 参数、返回值或副作用变化。
- 构建、路由、接口生成、mock 和主题配置变化。
- `CRouteObject` 字段或路由格式化逻辑变化。
