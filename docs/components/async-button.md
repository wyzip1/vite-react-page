# AsyncButton

源码路径：`src/components/AsyncButton.tsx`

`AsyncButton` 基于 Ant Design `Button` 封装异步点击 loading。它适合导出、保存、提交等点击后需要等待 Promise 完成的按钮。

## 类型

```ts
import type { ButtonProps } from "antd";

interface AsyncButtonProps extends Omit<ButtonProps, "onClick"> {
  onClick?(): any | Promise<any>;
}
```

组件通过 `forwardRef` 透传 ref：

```ts
React.LegacyRef<HTMLButtonElement | HTMLAnchorElement>
```

## Props

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `onClick` | `() => any \| Promise<any>` | 否 | `undefined` | 点击后执行。函数不接收原始 click event。 |
| `children` | `React.ReactNode` | 否 | `undefined` | 按钮内容。 |
| 其他 Button props | `Omit<ButtonProps, "onClick">` | 否 | Ant Design 默认值 | 透传给 Ant Design `Button`。 |
| `ref` | `HTMLButtonElement \| HTMLAnchorElement` | 否 | 无 | 透传给内部 `Button`。无额外实例方法。 |

## 内部状态

| 状态 | 类型 | 初始值 | 说明 |
| --- | --- | --- | --- |
| `actionLoading` | `boolean` | `false` | 点击开始置为 `true`，`onClick` 完成或抛错后在 `finally` 中恢复为 `false`。 |

## 事件流

```text
用户点击
  -> setActionLoading(true)
  -> await onClick?.()
  -> finally setActionLoading(false)
  -> Button 根据 loading 展示加载态
```

内部 JSX 顺序为：

```tsx
<Button ref={ref} loading={actionLoading} onClick={click} {...props}>
  {children}
</Button>
```

因此外部如果传入 `loading`，会覆盖内部 `actionLoading`。

## 示例

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

## 边界条件

- `onClick` 不接收 click event；需要事件对象时不能直接用当前类型。
- 没有重复点击锁；状态更新前连续点击可能并发执行。
- 外部 `loading` 会覆盖内部 loading。
- `onClick` 抛错时 loading 会恢复，但错误会继续向外抛给 React 事件链。
