# 组件总览

组件位于 `src/components`，主要面向管理端页面的查询、表格、上传、弹窗、操作按钮和路由懒加载场景。详细 API 请进入对应文档页。

## 组件清单

| 组件                                               | 路径                              | 主要职责                                                                   |
| -------------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------- |
| [Search](/components/search)                       | `src/components/Search`           | 配置化查询表单，支持输入、选择、级联、日期、日期范围和自定义组件。         |
| [EditTable](/components/edit-table)                | `src/components/EditTable`        | 基于 Ant Design Table 的行编辑表格，支持新增临时行、表单校验和点路径字段。 |
| [AsyncButton](/components/async-button)            | `src/components/AsyncButton.tsx`  | 自动处理异步点击 loading 的按钮。                                          |
| [CustomModal](/components/custom-modal)            | `src/components/CustomModal`      | 支持异步确认、表单提交和关闭重置的弹窗。                                   |
| [Action](/components/action)                       | `src/components/Action`           | 按需组合 Button 与 Popconfirm。                                            |
| [AutoActions](/components/auto-actions)            | `src/components/AutoActions`      | 将超出数量的操作项折叠到 Popover。                                         |
| [DropFolderUpload](/components/drop-folder-upload) | `src/components/DropFolderUpload` | 支持拖拽文件夹、图片过滤、校验、预览和自定义上传请求。                     |
| [UploadSorter](/components/upload-sorter)          | `src/components/UploadSorter`     | 支持图片上传、上传态展示、预览、删除和拖拽排序。                           |
| [LazyLoad](/components/lazy-load)                  | `src/components/LazyLoad`         | 用 Suspense 包裹懒加载组件，并展示统一 Loading。                           |
| [Loading](/components/loading)                     | `src/components/Loading.tsx`      | 通用居中 Spin 加载占位。                                                   |
| [Template](/components/template)                   | `src/components/Template`         | 渲染 React Router `Outlet` 的自动路由中间层占位。                          |

## 共同依赖

- Ant Design 是主要 UI 基础。
- `Search`、`EditTable`、`DropFolderUpload`、`UploadSorter` 会把部分 props 透传给 Ant Design 控件，但同名字段可能被组件接管或覆盖，需以各组件文档为准。
- `EditTable` 和上传组件依赖本地 `utils`，例如 `guid`、`getValue`、`setValue`、`sleep`。
- `CustomModal` 依赖本地 `useConfigurableEffect`。
- `UploadSorter` 依赖 `@dnd-kit` 和 `styled-components`。

## 使用建议

- 查询区域使用 `Search`，通过 `onSearch` 发起查询，通过 `onReset` 处理重置后的请求参数。
- 表格行编辑使用 `EditTable`，保存逻辑放在 `onSaveRecord`，新增行通过 ref 的 `addEditItem()` 触发。
- 单个异步操作使用 `AsyncButton`；危险操作使用 `Action` 的 `confirmProps`；操作项过多时用 `AutoActions` 折叠。
- 表单弹窗使用 `CustomModal`，命令式打开场景可结合 `useModal`。
- 图片排序使用 `UploadSorter`；需要拖拽本地文件夹并递归读取图片时使用 `DropFolderUpload`。
- 路由动态 import 使用 `createLazyLoad(lazy(() => import(...)))`，中间层路由占位使用 `Template`。

## 当前实现中需重点关注的边界

- `Search` 的 `config` 初始化会原地补充 `type/component`，且后续 `config` 变化不会自动重建 `formData`。
- `EditTable` 当前按字符串 `rowKey` 读取记录，不适合函数型 `rowKey`；`customEdit` 类型声明与实际传参不一致。
- `DropFolderUpload` 的文件夹拖拽依赖浏览器 File System Access API。
- `UploadSorter` 的上传按钮显示条件和常见 `maxCount` 语义可能不一致，需要主线程审核。
- `AutoActions` 在无 children 时仍可能渲染折叠触发器，`className` 未传时可能拼出 `undefined`。
- `Template` 使用 `Outlet` 但源码没有显式 import，依赖项目当前自动导入配置。

## 组合页说明

以下旧组合页保留为主题汇总，不再作为独立覆盖依据：

- `docs/components/actions-modal.md`
- `docs/components/upload.md`
- `docs/components/lazy-loading.md`
