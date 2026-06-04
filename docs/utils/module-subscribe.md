# module/subscribe

源码路径：`src/utils/module/subscribe.ts`

该模块导出一个事件总线实例 `events`，入口 `src/utils/index.ts` 以 `events` 名称转发。

## 类型

```ts
type unknownFunction = (...args: unknown[]) => unknown | Promise<unknown>;
type voidFunction = (...args: unknown[]) => void;
type unSubEvent = voidFunction;
```

`Events` 类内部状态：

```ts
#EventsList: Record<string, Array<unknownFunction> | undefined> = {};
```

## subEvent

```ts
events.subEvent(name: string, event: unknownFunction): unSubEvent
```

注册事件并返回取消订阅函数。

行为：

1. 如果 `#EventsList[name]` 不存在，初始化为空数组。
2. push 当前 event。
3. 返回 `() => this.removeEvent(name, event)`。

## removeEvent

```ts
events.removeEvent(name: string, event: unknownFunction): void
```

行为：

- 查找 `event` 在 `#EventsList[name]` 中的位置。
- 找不到时 `console.warn`。
- 找到时调用 `splice(eventIndex)`。

边界：

- 当前源码使用 `const eventIndex = this.#EventsList[name]?.indexOf(event) || -1`，当 event 位于索引 0 时会被当成 `-1`，无法移除。
- `splice(eventIndex)` 没有第二个参数，会从命中项删除到数组末尾。

## triggerEvent

```ts
events.triggerEvent(name: string, ...args: unknown[]): Promise<void>
```

行为：

- 按注册顺序遍历 `#EventsList[name] || []`。
- `await event(...args)`。
- 如果某个事件返回 `false`，立即 `Promise.reject()`。

边界：某个事件抛错会中断后续事件；返回值除 `false` 外不被使用。

## 示例

```ts
const unsubscribe = events.subEvent("saved", async data => {
  console.log(data);
});

await events.triggerEvent("saved", payload);
unsubscribe();
```
