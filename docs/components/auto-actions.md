# AutoActions

源码路径：`src/components/AutoActions/index.tsx`

`AutoActions` 用于表格操作列。它把前 `len` 个操作直接展示，把剩余操作折叠进 Ant Design `Popover`，并对折叠区子节点代理点击或确认事件。

## 类型

```ts
import type { PopoverProps } from "antd";

interface AutoActionsProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  trigger?: PopoverProps["trigger"];
  autoLoading?: boolean;
  len?: number;
}
```

`ProxyClickNode` 类型：

```ts
const ProxyClickNode: React.FC<{
  children?: React.ReactNode;
  onClick?(e: React.MouseEvent): any | Promise<any>;
  onChildHangOpenChange?: (open: boolean) => void;
  autoLoading?: boolean;
}>
```

## Props

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `children` | `React.ReactNode` | 否 | `undefined` | 操作项列表。 |
| `className` | `string` | 否 | `undefined` | 拼接到根节点 className。 |
| `style` | `React.CSSProperties` | 否 | `undefined` | 根节点行内样式。 |
| `trigger` | `PopoverProps["trigger"]` | 否 | `undefined` | 透传给 Popover。 |
| `autoLoading` | `boolean` | 否 | `undefined`；`ProxyClickNode` 内默认为 `true` | 折叠区普通点击异步执行期间是否显示 loading 图标。 |
| `len` | `number` | 否 | `3` | 直接展示的操作项数量。 |

## 内部状态

| 状态 | 类型 | 初始值 | 说明 |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | 父 Popover 打开状态。 |
| `childsHangOpen` | `boolean[]` | `[]` | 折叠区内确认类子节点的打开状态，任一为真时父 Popover 保持打开。 |
| `ProxyClickNode.loading` | `boolean` | `false` | 折叠区普通点击异步 loading。 |

## 渲染流程

```text
React.Children.map(children)
  -> slice(0, len) 直接展示
  -> children 数量大于 len 时渲染 SmallDashOutlined 触发器
  -> slice(len) 放入 Popover
  -> Popover 内每项用 ProxyClickNode 包裹
```

## 事件代理

`proxyNode` 对 React element 执行 `React.cloneElement`。

确认类节点判断方式：

```ts
if ("onConfirm" in props) {
  // 当成确认节点
}
```

确认节点代理：

- 新 `onConfirm` 先执行原 `props.onConfirm(e)`。
- 再执行外层 `onClick(e)`，AutoActions 用它关闭 Popover。
- 覆盖 `getPopupContainer` 为当前节点父元素。
- 覆盖 `onOpenChange`，把打开状态写入 `childsHangOpen`。

普通点击代理：

- 新 `onClick` 设置 `loading=true`。
- 依次等待原 `props.onClick(e)` 和外层 `onClick(e)`。
- finally 设置 `loading=false`。

## 示例

```tsx
<AutoActions len={3} trigger="click" autoLoading>
  <a onClick={edit}>编辑</a>
  <a onClick={copy}>复制</a>
  <Action confirmProps={{ title: "确认删除？", onConfirm: remove }}>删除</Action>
  <a onClick={detail}>详情</a>
</AutoActions>
```

## 边界条件

- 只有折叠区节点会被代理，前 `len` 个直接展示节点不会自动 loading。
- `className` 拼接为 `inline-flex ${className}`，未传时字符串中会出现 `undefined`。
- 折叠判断使用 `(childrenNodes?.length || len + 1) > len`，没有 children 时也可能渲染折叠触发器。
- 是否确认节点只看 props 中是否存在 `onConfirm`，不限定组件类型。
- 代理确认节点时会覆盖子节点原有 `getPopupContainer` 和 `onOpenChange`。
