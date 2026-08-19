# 弹窗、事件与副作用 Hooks

本文覆盖 `src/hooks/useModal`、`src/hooks/useWindowEvent.ts`、`src/hooks/useOnceState.ts`、`src/hooks/useUnFirstEffect.ts`、`src/hooks/useSub.ts`。

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
): (modalProps?: T) => Promise<Parameters<NonNullable<T["onConfirm"]>>[0]>
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

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `Modal` | `(props: T) => React.ReactNode` | 无 | 需要命令式打开的弹窗组件。组件会收到 `open`、`getContainer`、包装后的 `onConfirm`、`onCancel`、`afterClose` 以及调用 `openModal` 时传入的其它 props。 |
| `options.getContainer` | `() => HTMLElement` | `() => document.getElementById("app")!` | 指定创建挂载节点的父容器。 |

返回值：

| 名称 | 类型 | 说明 |
| --- | --- | --- |
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
): void
```

参数：

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `name` | `T extends keyof WindowEventMap` | 无 | `window` 事件名，例如 `"resize"`、`"scroll"`、`"keydown"`。 |
| `callback` | `Parameters<typeof window.addEventListener<T>>[1]` | 无 | 事件回调，按事件名获得对应事件类型。 |

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

## useOnceState

文件路径：`src/hooks/useOnceState.ts`

职责：首次挂载后读取一次 React Router 的 `location.state`，传给回调，然后清空浏览器 history state 中的 `usr` 字段，避免后续重复消费跳转状态。

### 类型

```ts
function useOnceState(callback: (v: any) => any): void
```

参数：

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `callback` | `(v: any) => any` | 无 | 接收 `Location.state` 的回调。返回值不会被使用。 |

生命周期：

- 内部调用 `useLocation()` 读取当前 `Location`。
- 首次挂载后执行一次 effect。
- effect 中先执行 `callback(Location.state)`。
- 然后执行 `window.history.replaceState({ ...(window.history.state || {}), usr: null }, "")`。
- 没有卸载清理逻辑。

示例：

```ts
useOnceState(state => {
  if (state?.fromCreate) {
    api.doSearch(searchParams);
  }
});
```

边界：

- 依赖 React Router 把 location state 存在 `history.state.usr` 的约定。
- 只清空 `usr`，保留 `history.state` 上其它字段。
- effect 依赖被显式禁用，后续路由 state 变化不会再次触发。
- 如果 `callback` 抛错，后面的 `replaceState` 不会执行。
- hook 直接访问 `window.history`，不适用于 SSR。

## useUnFirstEffect

文件路径：`src/hooks/useUnFirstEffect.ts`

职责：包装 `useEffect`，跳过首次 effect 执行，只在依赖后续变化时运行 callback。

### 类型

```ts
function useUnFirstEffect(
  cb: Parameters<typeof useEffect>[0],
  deps: Parameters<typeof useEffect>[1],
): void
```

参数：

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `cb` | `Parameters<typeof useEffect>[0]` | 无 | 依赖变化后要执行的函数。源码调用 `cb()`，但不使用其返回值。 |
| `deps` | `Parameters<typeof useEffect>[1]` | 无 | 传给内部 `useEffect` 的依赖数组。 |

生命周期与清理：

- `initRef.current` 初始为 `true`。
- 首次 effect 执行时只把 `initRef.current` 置为 `false`，不调用 `cb`。
- 之后每次 `deps` 变化都会调用 `cb()`。
- 当前实现没有返回 `cb()` 的结果，因此即使 `cb` 返回清理函数，也不会被 React 注册和执行。

示例：

```ts
useUnFirstEffect(() => {
  form.resetFields();
}, [form, open]);
```

源码中的 `CustomModal` 使用它在弹窗关闭后重置表单，同时避免初始化时重置。

边界：

- 如果需要 effect cleanup，当前 hook 不适合直接承载，应在源码层补充 `return cb()`。
- 内部禁用了 `react-hooks/exhaustive-deps`，调用方需要自行保证 `deps` 完整。

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

| 层级 | 类型 | 说明 |
| --- | --- | --- |
| key | `string` | 每个调用 `useSub` 的组件实例生成一个 `guid()` 作为订阅 ID。 |
| value | `EventItem[]` | 该组件实例传入的事件数组。 |
| `EventItem.name` | `string` | 事件名。 |
| `EventItem.callback` | `(...args: any[]) => any` | 事件回调。 |

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
