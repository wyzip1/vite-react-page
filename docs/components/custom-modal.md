# CustomModal

源码路径：`src/components/CustomModal/index.tsx`

`CustomModal` 基于 Ant Design `Modal`，统一处理确认按钮 loading，并在传入 `form` 时把确定按钮改为表单提交。

## 类型

```ts
import type { FormInstance, FormProps, ModalProps } from "antd";

export type CustomModalProps<T = any> = Omit<ModalProps, "onOk"> & {
  onConfirm?: (data: T) => any | Promise<any>;
  form?: FormInstance;
  formProps?: FormProps;
};
```

## Props

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `onConfirm` | `(data: T) => any \| Promise<any>` | 否 | `undefined` | 确认回调。无表单时入参为 `undefined as T`；有表单时入参为表单 values。 |
| `form` | `FormInstance` | 否 | `undefined` | 存在时 children 会被包裹进 Ant Design `Form`，点击确定执行 `form.submit()`。 |
| `formProps` | `FormProps` | 否 | `undefined` | 透传给内部 `Form`。组件固定设置 `onFinish={confirm}`，会覆盖 `formProps.onFinish`。 |
| `children` | `React.ReactNode` | 否 | `undefined` | 弹窗内容；有 `form` 时作为 `Form` 子节点。 |
| 其他 Modal props | `Omit<ModalProps, "onOk">` | 否 | Ant Design 默认值 | 透传给 `Modal`。`onOk` 被组件接管，使用方应改用 `onConfirm`。 |

## 内部状态

| 状态 | 类型 | 初始值 | 说明 |
| --- | --- | --- | --- |
| `actionLoading` | `boolean` | `false` | `confirm` 开始置为 `true`，`onConfirm` 完成或抛错后恢复为 `false`。 |
| `isForm` | `boolean` | `form !== undefined` | 决定点击确定时直接确认还是提交表单。 |

## 事件流

无表单：

```text
点击 Modal 确定
  -> confirm(undefined as T)
  -> setActionLoading(true)
  -> await onConfirm?.(undefined as T)
  -> setActionLoading(false)
```

有表单：

```text
点击 Modal 确定
  -> form.submit()
  -> Form 校验
  -> Form.onFinish(values)
  -> confirm(values)
  -> await onConfirm?.(values)
```

关闭重置：

```text
props.open 变化
  -> useUnFirstEffect 跳过首次
  -> open 为 false 时 form?.resetFields()
```

## 渲染结构

```tsx
<Modal confirmLoading={actionLoading} {...props} onOk={...}>
  {form ? (
    <Form form={form} {...formProps} onFinish={confirm}>
      {children}
    </Form>
  ) : (
    children
  )}
</Modal>
```

## 示例

```tsx
const [form] = Form.useForm();

<CustomModal
  title="编辑用户"
  open={open}
  form={form}
  formProps={{ layout: "vertical" }}
  onCancel={() => setOpen(false)}
  onConfirm={async values => {
    await saveUser(values);
    setOpen(false);
  }}
>
  <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
    <Input />
  </Form.Item>
</CustomModal>
```

## 边界条件

- `onOk` 不能直接传入，因为类型和实现都由组件接管。
- 组件只处理 loading，不会自行关闭弹窗；使用 `useModal` 时关闭由 `ModalWrapper` 处理，普通受控使用时由父组件处理。
- `formProps.onFinish` 会被覆盖；提交逻辑应放在 `onConfirm`。
- `useUnFirstEffect` 当前不接管 cleanup；这里仅用于关闭后重置字段。
- `onConfirm` 抛错时 loading 会恢复，但关闭逻辑取决于外层调用方。
