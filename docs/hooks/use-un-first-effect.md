# useUnFirstEffect

源码路径：`src/hooks/useUnFirstEffect.ts`

`useUnFirstEffect` 是一个跳过首次执行的 `useEffect` 包装。首次 effect 只标记初始化完成，依赖后续变化时才执行 callback。

## 类型

```ts
function useUnFirstEffect(
  cb: Parameters<typeof useEffect>[0],
  deps: Parameters<typeof useEffect>[1],
): void
```

## 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `cb` | `Parameters<typeof useEffect>[0]` | 是 | 无 | 依赖后续变化时执行的函数。源码调用 `cb()`，但不使用返回值。 |
| `deps` | `Parameters<typeof useEffect>[1]` | 是 | 无 | 传给内部 `useEffect` 的依赖数组。 |

无返回值。

## 内部状态

| ref | 类型 | 初始值 | 说明 |
| --- | --- | --- | --- |
| `initRef` | `React.MutableRefObject<boolean>` | `true` | 标记是否首次执行 effect。 |

## 生命周期

```text
首次 effect
  -> initRef.current 为 true
  -> 设置为 false
  -> return，不执行 cb

后续 deps 变化
  -> initRef.current 为 false
  -> 执行 cb()
```

## 示例

```ts
useUnFirstEffect(() => {
  form.resetFields();
}, [form, open]);
```

`CustomModal` 使用它在弹窗关闭后重置表单，同时避免初始化时重置。

## 边界条件

- 当前实现没有 `return cb()`，因此 `cb` 返回的 cleanup 不会被 React 注册。
- 内部禁用了 `react-hooks/exhaustive-deps`，调用方需要保证 `deps` 完整。
- 如果确实需要 cleanup，应使用原生 `useEffect` 或修改该 hook。
