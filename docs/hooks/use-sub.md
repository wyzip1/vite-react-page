# useSub 与 dispatchSubEvents

源码路径：`src/hooks/useSub.ts`

`useSub` 用于组件级事件订阅，`dispatchSubEvents` 用于广播事件。二者共享模块级全局事件表。

## 类型

```ts
interface EventItem {
  name: string;
  callback: (...args: any[]) => any;
}

const globalEvents: Record<string, EventItem[]> = {};

function useSub(events?: EventItem[]): void;

function dispatchSubEvents(name: string, ...args: any[]): void;
```

`EventItem` 当前未导出，但 TypeScript 结构类型允许直接传入同形对象。

## useSub 参数

| 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `events` | `EventItem[]` | 否 | `undefined`，按 `[]` 处理 | 当前组件要注册的事件列表。 |

无返回值。

## EventItem 字段

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `name` | `string` | 是 | 无 | 事件名。 |
| `callback` | `(...args: any[]) => any` | 是 | 无 | 事件回调。返回值不会被 `dispatchSubEvents` 使用。 |

## 全局事件表

```ts
const globalEvents: Record<string, EventItem[]> = {};
```

| 层级 | 类型 | 说明 |
| --- | --- | --- |
| key | `string` | 每个 hook 实例通过 `guid()` 生成的订阅 ID。 |
| value | `EventItem[]` | 当前组件实例传入的事件数组。 |

## 生命周期

```text
首次 render
  -> subIdRef.current = guid()

effect 执行
  -> globalEvents[subIdRef.current] = events || []

events 引用变化
  -> cleanup 删除旧 key
  -> effect 写入新数组

组件卸载
  -> 删除 globalEvents[subIdRef.current]
```

## dispatchSubEvents

```text
dispatchSubEvents(name, ...args)
  -> Object.keys(globalEvents)
  -> map 到所有 EventItem[]
  -> flat(2)
  -> 找到 event.name === name
  -> event.callback(...args)
```

行为：

- 同步调用 callback。
- 不收集返回值。
- 不 `await` Promise。
- 不捕获异常；某个 callback 抛错会中断后续派发。

## 示例

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

## 边界条件

- 事件名只是字符串，没有类型约束或命名空间隔离。
- 每次 render 都创建新的 `events` 数组会导致订阅频繁删除和重建，建议用 `useMemo` 固定引用。
- 派发只在同一打包模块实例内共享。
- 不适合长期状态同步；复杂共享状态应使用 Redux 或明确的数据流。
