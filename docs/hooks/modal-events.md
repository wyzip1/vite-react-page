# 弹窗、事件与副作用 Hooks

本文覆盖 `src/hooks/useModal`、`src/hooks/useWindowEvent.ts`、`src/hooks/useConfigurableEffect.ts`、`src/hooks/useSub.ts`。

## useModal

文件路径：

- `src/hooks/useModal/index.tsx`
- `src/hooks/useModal/ModalWrapper.tsx`

职责：

- `useModal` 创建一个命令式 `openModal` 函数。
- hook 挂载时在容器内创建独立 DOM 节点，并通过 `createRoot` 渲染 `ModalWrapper`。
- `ModalWrapper` 维护弹窗 open 状态和 props，包装 `onConfirm`、`onCancel`、`afterClose`，并补充 Redux `Provider` 与 `AntConfigProvider`。

### 类型

```ts
import type { CustomModalProps } from "@/components/CustomModal";

function useModal<T extends CustomModalProps<any>>(
  Modal: (props: T) => React.ReactNode,
  options?: {
    getContainer?: () => HTMLElement;
  },
): (modalProps?: T) => Promise<Parameters<NonNullable<T["onConfirm"]>>[0]>;
```

`CustomModalProps` 当前定义在 `src/components/CustomModal/index.tsx`：

```ts
export type CustomModalProps<T = any> = Omit<ModalProps, "onOk"> & {
  onConfirm?: (data: T) => any | Promise<any>;
  form?: FormInstance;
  formProps?: FormProps;
};
```

`ModalWrapper` 暴露给 ref 的实例类型：

```ts
export interface ModalWrapperInstance {
  open: (props: CustomModalProps<any>) => void;
  close: () => void;
}
```

`ModalWrapper` 自身 props：

```ts
interface ModalWrapperProps {
  getContainer?: () => HTMLElement;
  modal: React.FC<any>;
}
```

### 参数

| 参数                   | 类型                            | 默认值                                  | 说明                                                                                                                                                  |
| ---------------------- | ------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Modal`                | `(props: T) => React.ReactNode` | 无                                      | 需要命令式打开的弹窗组件。组件会收到 `open`、`getContainer`、包装后的 `onConfirm`、`onCancel`、`afterClose` 以及调用 `openModal` 时传入的其它 props。 |
| `options.getContainer` | `() => HTMLElement`             | `() => document.getElementById("app")!` | 指定创建挂载节点的父容器。                                                                                                                            |

返回值：

| 名称        | 类型                                                                      | 说明                                                                                     |
| ----------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `openModal` | `(modalProps?: T) => Promise<Parameters<NonNullable<T["onConfirm"]>>[0]>` | 打开弹窗，并返回一个 Promise。确认成功 resolve `onConfirm` 的第一个参数，取消时 reject。 |

### 挂载容器与生命周期

`useModal` 首次挂载时执行一次 effect：

1. 获取父容器：`options?.getContainer?.() || document.getElementById("app")!`。
2. 创建 `div`。
3. 使用 `guid()` 生成 id 并赋给该 `div`。
4. 把 `div` append 到父容器。
5. 使用 `createRoot(modelNode)` 渲染 `<ModalWrapper />`。
6. 把 `modelNodeRef.current` 指向新建 `div`。
7. 组件卸载时执行 `modelNode.remove()`。

`ModalWrapper` 渲染时会向实际弹窗传入：

```tsx
<props.modal
  getContainer={props.getContainer}
  {...modalProps}
  afterClose={() => {
    modalProps.afterClose?.();
    setModalProps({});
  }}
  open={openModalState}
  onConfirm={async data => {
    await modalProps?.onConfirm?.(data);
    setOpenModalState(false);
  }}
  onCancel={e => {
    modalProps.onCancel?.(e);
    setOpenModalState(false);
  }}
/>
```

注意：源码卸载时只移除 DOM 节点，没有显式调用 `root.unmount()`。

### Promise resolve/reject 行为

`openModal(modalProps)` 内部调用 `modalRef.current?.open()`，并替换传给弹窗的确认和取消回调。

确认链路：

1. 用户触发实际弹窗确认。
2. `ModalWrapper` 调用当前 `modalProps.onConfirm(data)`。
3. 这里的 `onConfirm` 是 `openModal` 注入的包装函数。
4. 包装函数先 `await` 调用方传入的原始 `modalProps?.onConfirm?.(data)`。
5. 原始确认成功后，`openModal` 返回的 Promise `resolve(data)`。
6. `ModalWrapper` 随后执行 `setOpenModalState(false)` 关闭弹窗。

取消链路：

1. 用户触发实际弹窗取消。
2. `ModalWrapper` 调用当前 `modalProps.onCancel(e)`。
3. 包装函数先让 `openModal` 返回的 Promise `reject(e)`。
4. 然后调用调用方传入的原始 `modalProps?.onCancel?.(e)`。
5. `ModalWrapper` 执行 `setOpenModalState(false)` 关闭弹窗。

边界：

- 如果原始 `onConfirm` reject 或 throw，`openModal` 的 Promise 不会 resolve；当前源码也没有调用 `rej`，因此该 Promise 可能保持 pending，弹窗也可能不关闭。
- 如果在 `useModal` 的 effect 完成前调用 `openModal`，`modalRef.current` 可能还不存在，Promise 会创建但不会打开弹窗，也不会自动 resolve/reject。
- `options.getContainer` 或默认 `#app` 必须返回真实 DOM 节点，否则 append 会失败。

### 示例

```tsx
const TestModal: React.FC<CustomModalProps<{ name: string }>> = props => {
  return <CustomModal {...props} />;
};

const openModal = useModal(TestModal);

async function handleEdit() {
  try {
    const formData = await openModal({
      title: "编辑",
      onConfirm: async data => {
        await save(data);
      },
    });
    console.log("confirmed", formData);
  } catch (error) {
    console.log("cancelled", error);
  }
}
```

## useWindowEvent

文件路径：`src/hooks/useWindowEvent.ts`

职责：注册一个 `window` 事件监听。当前实现不使用 `useEffect`，而是在每次 render 期间移除上一次 callback 并注册新的 callback。

### 类型

```ts
function useWindowEvent<T extends keyof WindowEventMap>(
  name: T,
  callback: Parameters<typeof window.addEventListener<T>>[1],
): void;
```

参数：

| 参数       | 类型                                               | 默认值 | 说明                                                        |
| ---------- | -------------------------------------------------- | ------ | ----------------------------------------------------------- |
| `name`     | `T extends keyof WindowEventMap`                   | 无     | `window` 事件名，例如 `"resize"`、`"scroll"`、`"keydown"`。 |
| `callback` | `Parameters<typeof window.addEventListener<T>>[1]` | 无     | 事件回调，按事件名获得对应事件类型。                        |

生命周期与清理：

- `cbRef` 保存上一次 callback。
- 每次调用 hook 时，如果 `cbRef.current` 存在，先执行 `window.removeEventListener(name, cbRef.current)`。
- 然后把 `callback` 保存到 `cbRef.current`，并执行 `window.addEventListener(name, cbRef.current)`。
- 当前实现没有卸载清理逻辑，组件卸载后最后一次注册的 listener 不会被 hook 自动移除。
- 不支持传入 `addEventListener` 的 options，例如 `capture`、`passive`、`once`。

示例：

```ts
useWindowEvent("resize", () => {
  console.log(window.innerWidth);
});
```

边界：

- hook 直接访问 `window`，不适用于 SSR。
- 因为监听注册发生在 render 阶段，组件频繁渲染时会频繁 remove/add。
- 如果 `name` 变化，源码只会按新 `name` 移除旧 callback，无法移除旧事件名下注册的 listener。

## useConfigurableEffect

文件路径：`src/hooks/useConfigurableEffect.ts`

职责：包装 `useEffect`，通过 `runOnMount`、`once` 和 `consumeRouteState` 统一控制首次执行、单次执行以及路由 state 的读取与清理。

### 类型

```ts
function useConfigurableEffect<T = unknown>(
  callback: (routeState?: T) => void | (() => void),
  deps: DependencyList | undefined,
  options?: {
    runOnMount?: boolean;
    once?: boolean;
    consumeRouteState?: boolean;
  },
): void;
```

配置：

| 配置                | 默认值  | 说明                                                                   |
| ------------------- | ------- | ---------------------------------------------------------------------- |
| `runOnMount`        | `true`  | 是否在首次挂载时执行 callback。                                        |
| `once`              | `false` | callback 是否最多执行一次。                                            |
| `consumeRouteState` | `false` | 是否把 `history.state.usr` 传给 callback，并在 callback 后清空 `usr`。 |

示例：

```ts
useConfigurableEffect(() => form.resetFields(), [form, open], { runOnMount: false });

useConfigurableEffect<{ fromCreate?: boolean }>(
  state => {
    if (state?.fromCreate) api.doSearch(searchParams);
  },
  undefined,
  { once: true, consumeRouteState: true },
);
```

callback 返回的 cleanup 会交给 React。调用方需保证 `deps` 完整；开启 `consumeRouteState` 时依赖浏览器 history 的 `usr` 存储约定，如果 callback 抛错则不会清理路由 state。

## useSub 与 dispatchSubEvents

文件路径：`src/hooks/useSub.ts`

职责：

- `useSub` 把当前组件的事件订阅数组写入模块级全局事件表。
- `dispatchSubEvents` 遍历该表，查找同名事件并同步调用回调。

### 类型

```ts
interface EventItem {
  name: string;
  callback: (...args: any[]) => any;
}

const globalEvents: Record<string, EventItem[]> = {};

function useSub(events?: EventItem[]): void;

function dispatchSubEvents(name: string, ...args: any[]): void;
```

`EventItem` 当前未导出，但 TypeScript 结构类型允许直接传入同形对象数组。

### 全局事件表

全局事件表是 `src/hooks/useSub.ts` 模块内的单例对象：

```ts
const globalEvents: Record<string, EventItem[]> = {};
```

结构：

| 层级                 | 类型                      | 说明                                                        |
| -------------------- | ------------------------- | ----------------------------------------------------------- |
| key                  | `string`                  | 每个调用 `useSub` 的组件实例生成一个 `guid()` 作为订阅 ID。 |
| value                | `EventItem[]`             | 该组件实例传入的事件数组。                                  |
| `EventItem.name`     | `string`                  | 事件名。                                                    |
| `EventItem.callback` | `(...args: any[]) => any` | 事件回调。                                                  |

注册和清理：

- `subIdRef` 首次渲染时通过 `guid()` 生成，并在组件实例生命周期内保持稳定。
- effect 执行时写入 `globalEvents[subIdRef.current] = events || []`。
- `events` 变化时，React 会先执行上一次 cleanup 删除旧 key，再执行新 effect 写入新数组。
- 组件卸载时删除 `globalEvents[subIdRef.current]`。

派发逻辑：

```ts
export function dispatchSubEvents(name: string, ...args: any[]) {
  const eventsList = Object.keys(globalEvents)
    .map(k => globalEvents[k])
    .flat(2);
  for (const event of eventsList) {
    if (event.name !== name) continue;
    event.callback(...args);
  }
}
```

行为：

- 同步遍历所有组件实例的订阅数组。
- 只调用 `event.name === name` 的 callback。
- `...args` 原样透传。
- 不收集 callback 返回值。
- 不 `await` Promise。
- 不捕获异常；某个 callback throw 会中断后续派发。

示例：

```ts
useSub([
  {
    name: "refresh-list",
    callback: () => api.doSearch(searchParams),
  },
  {
    name: "select-record",
    callback: (id: string) => setSelectedId(id),
  },
]);

dispatchSubEvents("refresh-list");
dispatchSubEvents("select-record", "1001");
```

边界：

- 事件名只是字符串，没有类型约束，也没有命名空间隔离。
- `events` 每次 render 都创建新数组时，会导致订阅 effect 频繁删除和重建；建议用 `useMemo` 固定引用。
- 派发是模块级全局表，只在同一打包模块实例内共享。
- 不适合长期状态同步；复杂共享状态应使用 Redux 或更明确的数据流。
