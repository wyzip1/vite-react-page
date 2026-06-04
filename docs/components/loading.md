# Loading

源码路径：`src/components/Loading.tsx`

`Loading` 是通用加载占位组件，使用 Ant Design `Spin` 和 `LoadingOutlined`。

## 类型

```ts
function Loading(): JSX.Element;
```

不接收 props，无 ref、无内部状态。

## 渲染结构

根节点是行内样式 `div`：

| 样式字段 | 值 |
| --- | --- |
| `width` | `"100%"` |
| `height` | `"100%"` |
| `display` | `"flex"` |
| `justifyContent` | `"center"` |
| `alignItems` | `"center"` |

内部渲染：

```tsx
<Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
```

## 示例

```tsx
<div style={{ height: 240 }}>
  <Loading />
</div>
```

## 边界条件

- 根节点高度是 `100%`，父容器需要明确高度。
- 没有文案、尺寸、颜色或全屏配置。
- 通常作为 `LazyLoad` 的 Suspense fallback 使用。
