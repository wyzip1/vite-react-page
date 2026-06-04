# useModal

源码路径：

- `src/hooks/useModal/index.tsx`
- `src/hooks/useModal/ModalWrapper.tsx`

`useModal` 用于命令式打开弹窗。它会在指定容器内创建一个独立 DOM 节点，用 `createRoot` 渲染 `ModalWrapper`，并返回 Promise 化的 `openModal`。

## 类型

```ts
import type { CustomModalProps } from "@/components/CustomModal";

function useModal<T extends CustomModalProps<any>>(
  Modal: (props: T) => React.ReactNode,
  options?: {
    getContainer?: () => HTMLElement;
  },
): (modalProps?: T) => Promise<Parameters<NonNullable<T["onConfirm"]>>[0]>
```

`ModalWrapper` ref 类型：

```ts
export interface ModalWrapperInstance {
  open: (props: CustomModalProps<any>) => void;
  close: () => void;
}
```

`ModalWrapper` props：

```ts
interface ModalWrapperProps {
  getContainer?: () => HTMLElement;
  modal: React.FC<any>;
}
```

## 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `Modal` | `(props: T) => React.ReactNode` | 是 | 无 | 要命令式打开的弹窗组件。通常是 `CustomModal` 或其包装组件。 |
| `options.getContainer` | `() => HTMLElement` | 否 | `() => document.getElementById("app")!` | 指定挂载节点的父容器。 |

## 返回值

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `openModal` | `(modalProps?: T) => Promise<Parameters<NonNullable<T["onConfirm"]>>[0]>` | 打开弹窗。确认成功 resolve 确认数据，取消 reject。 |

## 生命周期

挂载：

```text
useEffect 首次执行
  -> 找到 container
  -> document.createElement("div")
  -> div.id = guid()
  -> container.appendChild(div)
  -> createRoot(div).render(<ModalWrapper />)
  -> modelNodeRef.current = div
```

卸载：

```text
cleanup
  -> modelNode.remove()
```

当前实现没有调用 `root.unmount()`。

## ModalWrapper 行为

`ModalWrapper` 内部状态：

| 状态 | 类型 | 初始值 | 说明 |
| --- | --- | --- | --- |
| `modalProps` | `CustomModalProps<any>` | `{}` | 当前弹窗 props。 |
| `openModalState` | `boolean` | `false` | 当前弹窗是否打开。 |

ref 方法：

| 方法 | 类型 | 说明 |
| --- | --- | --- |
| `open` | `(props: CustomModalProps<any>) => void` | 设置 `openModalState=true` 并保存 props。 |
| `close` | `() => void` | 设置 `openModalState=false`。 |

渲染时额外包裹：

```text
Provider(store)
  AntConfigProvider
    props.modal(...)
```

## Promise 行为

确认：

```text
用户确认
  -> ModalWrapper 调用 modalProps.onConfirm(data)
  -> openModal 注入的 onConfirm 先 await 原始 onConfirm
  -> resolve(data)
  -> ModalWrapper setOpenModalState(false)
```

取消：

```text
用户取消
  -> openModal 注入的 onCancel reject(e)
  -> 调用原始 onCancel(e)
  -> ModalWrapper setOpenModalState(false)
```

`afterClose`：

```text
弹窗关闭动画结束
  -> 调用原始 modalProps.afterClose?.()
  -> setModalProps({})
```

## 示例

```tsx
const TestModal: React.FC<CustomModalProps<{ name: string }>> = props => {
  return <CustomModal {...props} />;
};

const openModal = useModal(TestModal);

async function handleOpen() {
  try {
    const data = await openModal({
      title: "编辑",
      onConfirm: async values => {
        await save(values);
      },
    });
    console.log(data);
  } catch (error) {
    console.log("cancel", error);
  }
}
```

## 边界条件

- `options.getContainer` 或默认 `#app` 必须存在。
- 如果在 effect 完成前调用 `openModal`，`modalRef.current` 可能为空，Promise 可能不会 resolve/reject。
- 原始 `onConfirm` reject 或 throw 时，当前 Promise 不会 resolve，且没有显式 reject。
- 卸载时只移除 DOM，没有 `root.unmount()`。
- 该 hook 直接访问 `document`，不适合 SSR。
