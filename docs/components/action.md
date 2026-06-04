# Action

源码路径：

- `src/components/Action/index.tsx`
- `src/components/Action/styled.ts`

`Action` 用于把操作文案或节点按需包装成 Ant Design `Button`，再按需包装 `Popconfirm`。

## 类型

```ts
import type { ButtonProps, PopconfirmProps } from "antd";

interface ActionProps {
  children: React.ReactNode;
  btnProps?: ButtonProps | true;
  confirmProps?: PopconfirmProps;
}
```

## Props

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `children` | `React.ReactNode` | 是 | 无 | 操作文案或节点。 |
| `btnProps` | `ButtonProps \| true` | 否 | `undefined` | `true` 时渲染默认 Button；对象时透传给 Button；未传时不包 Button。 |
| `confirmProps` | `PopconfirmProps` | 否 | `undefined` | 存在时用 Popconfirm 包裹按钮或原始 children。 |

无 ref、无内部状态。

## 包装顺序

```text
children
  -> btnProps ? Button : 原节点
  -> confirmProps ? Popconfirm : 原节点
  -> ActionStyled
```

`ActionStyled` 当前是空 styled wrapper，没有额外样式。

## 示例

```tsx
<Action
  btnProps={{ type: "link", danger: true }}
  confirmProps={{ title: "确认删除？", onConfirm: handleDelete }}
>
  删除
</Action>
```

## 边界条件

- `btnProps === true` 会创建 `<Button>{children}</Button>`。
- 不传 `btnProps` 但传 `confirmProps` 时，Popconfirm 直接包裹原始 children。
- 事件由 Ant Design `Button` 和 `Popconfirm` 自己处理，`Action` 不额外代理。
