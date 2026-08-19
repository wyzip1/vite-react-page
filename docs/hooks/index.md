# Hooks 总览

`src/hooks` 下的 hooks 用于封装请求、分页列表、命令式弹窗、窗口事件、一次性路由状态、副作用执行时机和组件间临时事件广播。本文档按源码行为描述，重点说明类型、默认值、生命周期和边界条件。

## 清单

| 名称                                                    | 文件路径                              | 职责                                                                                                     |
| ------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [useRequest](/hooks/use-request)                        | `src/hooks/useRequest.ts`             | 包装 Promise 请求，提供触发函数、响应数据、loading、手动改写数据和 axios cancel token 取消能力。         |
| [useFetchList](/hooks/use-fetch-list)                   | `src/hooks/useFetchList.ts`           | 基于 `useRequest` 封装分页列表请求，处理页码、页大小、列表、总数、查询、刷新、重置和本地列表更新。       |
| [useModal](/hooks/use-modal)                            | `src/hooks/useModal/index.tsx`        | 命令式创建弹窗挂载节点，返回 Promise 化的 `openModal`。                                                  |
| [ModalWrapper](/hooks/use-modal)                        | `src/hooks/useModal/ModalWrapper.tsx` | 维护弹窗 open 状态和 props，向弹窗补充 Provider、AntConfigProvider、confirm/cancel/afterClose 包装逻辑。 |
| [useWindowEvent](/hooks/use-window-event)               | `src/hooks/useWindowEvent.ts`         | 注册 `window` 事件监听，并在下一次渲染时替换上一次 callback。                                            |
| [useConfigurableEffect](/hooks/use-configurable-effect) | `src/hooks/useConfigurableEffect.ts`  | 配置首次执行、单次执行以及路由 state 的读取与清理。                                                      |
| [useSub](/hooks/use-sub)                                | `src/hooks/useSub.ts`                 | 将组件事件数组写入模块级全局事件表，随组件生命周期自动注册和删除。                                       |
| [dispatchSubEvents](/hooks/use-sub)                     | `src/hooks/useSub.ts`                 | 遍历全局事件表并同步触发同名事件。                                                                       |

## 选择建议

| 场景                           | 建议                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| 普通详情、保存、导出等单次请求 | 使用 `useRequest`。请求函数需要接受对象参数，hook 会向参数对象注入 `cancelToken`。    |
| 表格分页、搜索、刷新当前页     | 使用 `useFetchList`。接口响应默认需要是 `{ data?: { list?: T[]; total?: number } }`。 |
| 页面按钮打开弹窗并等待确认结果 | 使用 `useModal`。确认成功 resolve，取消 reject。                                      |
| 只想消费一次页面跳转 state     | 使用 `useConfigurableEffect`，配置 `{ once: true, consumeRouteState: true }`。        |
| 跳过初始化副作用               | 使用 `useConfigurableEffect`，配置 `{ runOnMount: false }`。                          |
| React 组件间临时广播           | 使用 `useSub` 和 `dispatchSubEvents`。长期共享状态仍应使用 Redux 或明确的数据流。     |

## 通用依赖假设

- 项目通过自动导入或全局声明提供 React hooks，例如 `useState`、`useRef`、`useEffect`、`useMemo`、`useImperativeHandle`、`forwardRef`、`useLocation`。
- 请求取消基于 axios `CancelToken`，只有请求函数把 `cancelToken` 传给 axios 实例时才会真正取消网络请求。
- 这些 hooks 面向浏览器运行环境；`useModal`、`useWindowEvent` 以及开启 `consumeRouteState` 的 `useConfigurableEffect` 会访问 `document` 或 `window`。

## 组合页说明

`docs/hooks/modal-events.md` 保留为弹窗、事件与副作用主题汇总，不再作为独立覆盖依据。逐项审核以 `use-modal`、`use-window-event`、`use-configurable-effect`、`use-sub` 为准。
