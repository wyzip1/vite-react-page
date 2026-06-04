# 弹窗与操作组件

本页覆盖 `AsyncButton`、`CustomModal`、`Action` 和 `AutoActions`，它们主要用于管理端页面的异步按钮、表单弹窗、二次确认和表格操作项折叠。

## AsyncButton

`AsyncButton` 位于 `src/components/AsyncButton.tsx`。

### 职责

基于 Ant Design `Button` 封装异步点击 loading。点击后等待 `onClick` 执行完成，再关闭 loading。

### Props 与 Ref

组件类型为 `Omit<ButtonProps, "onClick"> & { onClick?(): any | Promise<any> }`，其他字段透传给 Ant Design `Button`。

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `onClick` | `() => any \| Promise<any>` | 否 | `undefined` | 点击后执行。函数不接收 Ant Design 原始 click event。 |
| `children` | `React.ReactNode` | 否 | `undefined` | 按钮内容。 |
| 其他 `ButtonProps` | Ant Design 类型 | 否 | Ant Design 默认值 | 透传给 `Button`。组件自己的 `loading` 和 `onClick` 在展开 props 前传入，因此 `props.loading` 会覆盖内部 loading。 |
| `ref` | `HTMLButtonElement \| HTMLAnchorElement` | 否 | 无 | 通过 `forwardRef` 透传给 Ant Design `Button`。无额外实例方法。 |

### 内部状态与事件流

| 状态 | 类型 | 初始值 | 说明 |
| --- | --- | --- | --- |
| `actionLoading` | `boolean` | `false` | 点击开始置 `true`，`onClick` 完成或抛错后在 `finally` 置 `false`。 |

流程：点击按钮 -> `setActionLoading(true)` -> `await onClick?.()` -> `finally setActionLoading(false)`。

### 使用示例

```tsx
<AsyncButton
  type="primary"
  onClick={async () => {
    await exportData();
  }}
>
  导出
</AsyncButton>
```

### 注意事项

- 不会把 click event 传给 `onClick`。
- 没有防重复点击锁；如果用户在状态刷新前连续点击，仍可能并发执行。
- 如果外部传入 `loading`，会覆盖内部 `actionLoading`。

## CustomModal

`CustomModal` 位于 `src/components/CustomModal`。

### 职责

基于 Ant Design `Modal` 封装确认 loading，并在传入 `form` 时把确定按钮转为表单提交。常与 `src/hooks/useModal` 搭配命令式打开弹窗。

### Props

`CustomModalProps<T> = Omit<ModalProps, "onOk"> & { onConfirm?: (data: T) => any | Promise<any>; form?: FormInstance; formProps?: FormProps }`。

| 字段 | 类型 | 必填 | 默认值 | 透传关系与说明 |
| --- | --- | --- | --- | --- |
| `onConfirm` | `(data: T) => any \| Promise<any>` | 否 | `undefined` | 确认回调。无表单时入参是 `undefined as T`；有表单时入参是 `Form.onFinish` 的 values。 |
| `form` | `FormInstance` | 否 | `undefined` | 存在时 children 被包裹进 Ant Design `Form`，点击确定执行 `form.submit()`。 |
| `formProps` | `FormProps` | 否 | `undefined` | 透传给内部 `Form`。组件最后固定 `onFinish={confirm}`，会覆盖 `formProps.onFinish`。 |
| `children` | `React.ReactNode` | 否 | `undefined` | 弹窗内容；有 `form` 时作为 `Form` 子节点。 |
| 其他 `ModalProps` | Ant Design 类型 | 否 | Ant Design 默认值 | 透传给 `Modal`。`onOk` 被组件接管，不能直接传入。 |

### 内部状态与事件流

| 状态 | 类型 | 初始值 | 说明 |
| --- | --- | --- | --- |
| `actionLoading` | `boolean` | `false` | `confirm` 开始置真，`onConfirm` 完成或抛错后置假，并传给 `Modal.confirmLoading`。 |
| `isForm` | `boolean` | `form !== undefined` | 决定确定按钮是提交表单还是直接确认。 |

无表单流程：点击确定 -> 调用 `confirm(undefined as T)` -> 设置 `confirmLoading` -> 等待 `onConfirm` -> 关闭 loading。

有表单流程：点击确定 -> `form.submit()` -> 表单校验通过后触发 `Form.onFinish` -> 调用 `confirm(values)` -> 等待 `onConfirm`。

关闭重置：`useUnFirstEffect` 监听 `[form, props.open]`，跳过首次执行；当 `props.open` 变为假值时调用 `form?.resetFields()`。

### 依赖

- Ant Design：`Modal`、`Form`。
- 本地 hook：`useUnFirstEffect`。
- 常见搭配：`src/hooks/useModal` 会在独立 React root 中渲染 `CustomModal`，并在 `onConfirm` 后关闭弹窗。

### 使用示例

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

### 注意事项

- `onOk` 被移除并由组件内部接管，需要使用 `onConfirm`。
- `formProps.onFinish` 会被覆盖；提交后的业务逻辑应写在 `onConfirm`。
- 组件只负责 loading，不会自动关闭弹窗；是否关闭由父组件或 `useModal` 包装层决定。
- 关闭后只在传入 `form` 时重置字段。

## Action

`Action` 位于 `src/components/Action`。

| 文件 | 职责 |
| --- | --- |
| `src/components/Action/index.tsx` | 组合 `Button` 与 `Popconfirm`。 |
| `src/components/Action/styled.ts` | 空 styled wrapper。 |

### 职责

把任意 `children` 按需包装为 Ant Design `Button`，再按需包一层 `Popconfirm`，用于删除、下架等需要二次确认的操作。

### Props

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `children` | `React.ReactNode` | 是 | 无 | 操作文案或节点。 |
| `btnProps` | `ButtonProps \| true` | 否 | `undefined` | 为 `true` 时渲染默认 `Button`；为对象时透传给 `Button`；未传时不包按钮。 |
| `confirmProps` | `PopconfirmProps` | 否 | `undefined` | 存在时用 `Popconfirm` 包裹按钮或原始 children。 |

无 ref/instance 方法，无内部状态。

### 使用示例

```tsx
<Action
  btnProps={{ type: "link", danger: true }}
  confirmProps={{ title: "确认删除？", onConfirm: handleDelete }}
>
  删除
</Action>
```

### 事件流与注意事项

- 包装顺序固定为：`children` -> 可选 `Button` -> 可选 `Popconfirm` -> `ActionStyled`。
- `btnProps` 和 `confirmProps` 的事件完全由 Ant Design 组件处理。
- `ActionStyled` 当前没有额外 CSS。

## AutoActions

`AutoActions` 位于 `src/components/AutoActions`。

### 职责

将操作项按数量拆分：前 `len` 个直接展示，超出的放入 `Popover`。折叠区里的子节点会经过 `ProxyClickNode` 代理，点击或确认后自动关闭 Popover，并可显示异步 loading。

### Props

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `children` | `React.ReactNode` | 否 | `undefined` | 操作项列表。 |
| `className` | `string` | 否 | `undefined` | 拼到根节点 `className`，根节点固定有 `inline-flex`。 |
| `style` | `React.CSSProperties` | 否 | `undefined` | 根节点样式。 |
| `trigger` | `PopoverProps["trigger"]` | 否 | `undefined` | 透传给折叠区 `Popover`。 |
| `autoLoading` | `boolean` | 否 | `undefined`，在 `ProxyClickNode` 内默认为 `true` | 控制折叠区普通点击异步执行期间是否显示 `LoadingOutlined`。 |
| `len` | `number` | 否 | `3` | 直接展示的子节点数量。 |

`ProxyClickNode` 额外接收：

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | `undefined` | 被代理的子节点。 |
| `onClick` | `(e: React.MouseEvent) => any \| Promise<any>` | `undefined` | 代理节点自身事件完成后执行，`AutoActions` 用它关闭 Popover。 |
| `onChildHangOpenChange` | `(open: boolean) => void` | `undefined` | 子节点是 Popconfirm 时接收打开状态，用于保持父 Popover 打开。 |
| `autoLoading` | `boolean` | `true` | 普通点击时是否用 `LoadingOutlined` 替换节点。 |

### 内部状态与事件流

| 状态 | 类型 | 初始值 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | 父级 `Popover` 打开状态。 |
| `childsHangOpen` | `boolean[]` | `[]` | 折叠区内 Popconfirm 子节点的打开状态。任一为真时父 Popover 保持打开。 |
| `ProxyClickNode.loading` | `boolean` | `false` | 普通点击的异步 loading。 |

渲染流程：

1. `React.Children.map(children, c => c)` 生成子节点数组。
2. `slice(0, len)` 直接展示。
3. 当子节点数量大于 `len` 时，渲染 `SmallDashOutlined` 作为 Popover 触发器。
4. `slice(len)` 的节点放入 Popover 内容，每项外层固定 `minWidth: 88, height: 28`。

代理点击流程：

- 如果子节点 props 中存在 `onConfirm`，认为它是确认类节点：代理后的 `onConfirm` 先执行原 `props.onConfirm(e)`，再执行外层 `onClick(e)`；同时设置 `getPopupContainer` 为当前节点父元素，并把 `onOpenChange` 交给 `onChildHangOpenChange`。
- 如果子节点没有 `onConfirm`，代理 `onClick`：置 `loading=true`，依次等待原 `props.onClick(e)` 和外层 `onClick(e)`，最后关闭 loading。

### 依赖

- Ant Design：`Popover`。
- Ant Design Icons：`SmallDashOutlined`、`LoadingOutlined`。
- React：`Children.map`、`cloneElement`。

### 使用示例

```tsx
<AutoActions len={3} trigger="click" autoLoading>
  <a onClick={edit}>编辑</a>
  <a onClick={copy}>复制</a>
  <Action confirmProps={{ title: "确认删除？", onConfirm: remove }}>删除</Action>
  <a onClick={detail}>详情</a>
</AutoActions>
```

### 注意事项与边界条件

- 只有折叠区的子节点会被 `ProxyClickNode` 代理，直接展示的前 `len` 个不会自动 loading，也不会自动关闭 Popover。
- `className` 拼接为 ``inline-flex ${className}``，未传时会产生字符串里的 `undefined`。
- 折叠判断使用 `(childrenNodes?.length || len + 1) > len`；没有 children 时也可能渲染折叠触发器。
- `proxyNode` 只处理 React element；字符串、数字、fragment 等非有效 element 会原样返回。
- 是否是确认节点通过 props 中是否存在 `onConfirm` 判断，不限定必须是 `Popconfirm`。
- 确认节点不会显示 `ProxyClickNode.loading`，普通点击节点才会。
- 代理确认节点时会覆盖子节点原有的 `getPopupContainer` 和 `onOpenChange`。
