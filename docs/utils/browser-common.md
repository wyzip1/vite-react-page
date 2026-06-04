# 浏览器与通用工具

本页覆盖 `src/utils/index.ts` 中直接实现的通用工具，以及 `copy`、`subscribe` 模块的全部导出。

## `src/utils/module/copy.ts`

职责：提供图片加载、DOM 选择复制、文本复制、图片复制和统一复制提示。该模块依赖浏览器环境，并依赖 Ant Design `message` 做成功/失败提示。

### createImg

```ts
createImg(url: string): Promise<HTMLImageElement>
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `url` | `string` | 无 | 图片地址，会赋值给 `img.src`。 |

返回：图片 `load` 后 resolve `HTMLImageElement`；`error` 后 reject 原始错误事件。

行为：创建 `img` 元素，设置 `crossOrigin = "Anonymous"`。不修改入参；依赖 `document.createElement`；副作用是发起图片请求。

```ts
const img = await createImg("https://example.com/a.png");
document.body.appendChild(img);
```

边界：跨域图片仍需服务端允许 CORS；加载失败会 reject。

### copyToEl

```ts
copyToEl(el: Element): void
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `el` | `Element` | 无 | 待复制内容所在 DOM 节点。 |

返回：`void`。

行为：清空当前选择区，创建 `Range` 选中 `el`，将 `el` 临时追加到 `document.body`，执行 `document.execCommand("copy")` 后移除。会移动传入元素到 `body`，再从 `body` 移除；依赖 `window.getSelection`、`document.createRange`、`document.execCommand`；副作用是写剪贴板和短暂改变 DOM。

```ts
const span = document.createElement("span");
span.innerText = "hello";
copyToEl(span);
```

边界：`execCommand("copy")` 是旧 API，浏览器可能因权限或非用户手势拒绝。

### copyText

```ts
copyText(data: string): Promise<void>
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `data` | `string` | 无 | 要写入剪贴板的文本。 |

返回：复制完成后 resolve 的 `Promise<void>`。

行为：先通过 `navigator.permissions.query({ name: "clipboard-write" })` 检查权限；权限为 `granted` 时调用 `navigator.clipboard.writeText(data)`；否则创建 `span` 并回退到 `copyToEl`。不修改入参；依赖 Clipboard、Permissions、DOM API；副作用是写剪贴板。

```ts
await copyText("订单号 123");
```

边界：当前实现只在权限状态严格等于 `granted` 时使用 Clipboard API，`prompt` 等状态会走 DOM 回退。

### copyImg

```ts
copyImg(data: { type: "img"; url: string }): Promise<void>
```

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `data.type` | `"img"` | 无 | 固定为图片复制标识。 |
| `data.url` | `string` | 无 | 图片地址。 |

返回：复制完成后 resolve 的 `Promise<void>`。

行为：权限为 `granted` 时 `fetch(data.url)` 并通过 `navigator.clipboard.write([new ClipboardItem(...)])` 写入图片；否则调用 `createImg` 加载图片，再用 `copyToEl` 复制。不修改入参；依赖 Permissions、Clipboard、`ClipboardItem`、`fetch`、DOM API；副作用是请求图片并写剪贴板。

```ts
await copyImg({ type: "img", url: "https://example.com/logo.png" });
```

边界：图片类型由响应 `blob.type` 决定；跨域、权限、浏览器不支持 `ClipboardItem` 都可能失败。

### copyInfo

```ts
copyInfo(data?: string | { type: "img"; url: string }): Promise<void>
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `data` | `string \| { type: "img"; url: string } \| undefined` | `undefined` | 字符串按文本复制；对象按图片复制；空值直接返回。 |

返回：`Promise<void>`。

行为：捕获同步错误；字符串调用 `copyText`，图片对象调用 `copyImg`，成功后显示 `message.success("复制成功")`，失败时打印 `console.log("copy error:", error)` 并显示 `message.error("复制失败")`。不修改入参；依赖 copy 底层方法和 antd message；副作用是写剪贴板、发请求、显示提示、失败日志。

```ts
await copyInfo("hello");
await copyInfo({ type: "img", url: "https://example.com/a.png" });
await copyInfo(); // 无操作
```

边界：当前实现没有 `await copyText/copyImg`，异步复制失败不一定会被 `try/catch` 捕获，主线程审核时建议关注。

## `src/utils/module/subscribe.ts`

职责：提供一个全局事件总线实例 `events`。入口 `@/utils` 默认导出的是实例，不导出 `Events` 类和内部类型。

### events.subEvent

```ts
events.subEvent(
  name: string,
  event: (...args: unknown[]) => unknown | Promise<unknown>,
): (...args: unknown[]) => void
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `name` | `string` | 无 | 事件名。 |
| `event` | `(...args: unknown[]) => unknown \| Promise<unknown>` | 无 | 事件处理器。 |

返回：取消订阅函数 `unSubEvent`，调用后移除当前处理器。

行为：事件名不存在时创建数组，再追加处理器。不修改调用方入参；不依赖浏览器 API；副作用是修改事件总线内部列表。

```ts
const unsubscribe = events.subEvent("saved", async payload => {
  console.log(payload);
});

unsubscribe();
```

边界：同一函数重复订阅会保存多次，需要对应取消多次。

### events.removeEvent

```ts
events.removeEvent(
  name: string,
  event: (...args: unknown[]) => unknown | Promise<unknown>,
): void
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `name` | `string` | 无 | 事件名。 |
| `event` | `(...args: unknown[]) => unknown \| Promise<unknown>` | 无 | 要移除的处理器引用。 |

返回：`void`。

行为：查找处理器并从内部数组移除；找不到时 `console.warn`。不依赖浏览器 API；副作用是修改内部列表或打印警告。

边界：当前实现 `splice(eventIndex)` 未传删除数量，会从命中的处理器一直删到数组末尾；`indexOf` 返回 `0` 时因 `|| -1` 会被当作找不到，需主线程审核。

### events.triggerEvent

```ts
events.triggerEvent(name: string, ...args: unknown[]): Promise<void>
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `name` | `string` | 无 | 事件名。 |
| `...args` | `unknown[]` | `[]` | 传给每个处理器的参数。 |

返回：全部处理器执行完成后 resolve；任一处理器返回 `false` 时 `Promise.reject()`。

行为：按注册顺序串行 `await` 每个处理器。不修改入参；不依赖浏览器 API；副作用来自处理器本身。

```ts
const off = events.subEvent("beforeSave", data => {
  if (!data) return false;
});

await events.triggerEvent("beforeSave", formData);
off();
```

边界：没有订阅者时直接 resolve；处理器抛错会让 `triggerEvent` reject。

## `src/utils/index.ts` 通用工具

### guid

```ts
guid(): string
```

返回：形如 `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx` 的随机字符串。

行为：使用 `Math.random()` 替换模板字符。不修改入参；不依赖浏览器 API；无外部副作用。

```ts
const rowKey = guid();
```

边界：适合前端临时 key，不适合作为安全随机 ID 或后端唯一约束。

### debounce

```ts
debounce(event: Function, delay = 300): (...args: unknown[]) => void
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `event` | `Function` | 无 | 延迟执行的函数。 |
| `delay` | `number` | `300` | 防抖等待毫秒数。 |

返回：包装函数。

行为：连续调用会清理上一轮 `setTimeout`，只在最后一次调用后延迟执行 `event(...args)`。不修改入参；依赖计时器 API；副作用是创建/清理定时器，以及最终执行 `event`。

```ts
const onSearch = debounce((keyword: string) => {
  fetchList(keyword);
}, 500);
```

边界：没有保留调用时的 `this`；包装函数自身不返回 `event` 的返回值。

### throttle

```ts
throttle(fn: Function, delay = 300): (...args: unknown[]) => void
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `fn` | `Function` | 无 | 立即执行的函数。 |
| `delay` | `number` | `300` | 节流窗口毫秒数。 |

返回：包装函数。

行为：第一次调用立即执行 `fn(...args)`，随后 `delay` 毫秒内的调用被忽略，计时结束后允许下一次执行。不修改入参；依赖计时器 API；副作用是创建定时器并执行 `fn`。

```ts
const onScroll = throttle(() => {
  loadMore();
}, 300);
```

边界：没有尾部执行；没有保留调用时的 `this`；包装函数不返回 `fn` 的返回值。

### toggleList

```ts
toggleList<T>(
  list: T[],
  item: T,
  customValidate?: (item: T) => boolean,
): T[]
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `list` | `T[]` | 无 | 被切换的数组。 |
| `item` | `T` | 无 | 不存在时追加的元素。 |
| `customValidate` | `(item: T) => boolean` | `undefined` | 自定义匹配函数；未传时使用 `e === item`。 |

返回：同一个数组引用 `list`。

行为：找到匹配项则 `splice(index, 1)` 删除；找不到则 `push(item)` 追加。会修改入参数组；不依赖浏览器 API；副作用是原数组内容变化。

```ts
const ids = [1, 2];
toggleList(ids, 2); // [1]
toggleList(ids, 3); // [1, 3]

toggleList(users, current, user => user.id === current.id);
```

边界：`customValidate` 只接收数组当前项，不接收新 `item`；匹配到多个元素时只删除第一个。

### selectFile

```ts
selectFile(type = "*", mutiple = false): Promise<FileList | null>
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `string` | `"*"` | input `accept` 值，如 `"image/*"`。 |
| `mutiple` | `boolean` | `false` | 是否允许多选。参数名按源码拼写为 `mutiple`。 |

返回：选择变化时 resolve `input.files`，类型为 `FileList | null`。

行为：创建 `<input type="file">`，设置 `multiple` 和 `accept`，监听 `change` 后 resolve，然后调用 `input.click()`。不修改入参；依赖 DOM 和 File API；副作用是打开文件选择弹窗。

```ts
const files = await selectFile("image/*", true);
const first = files?.[0];
```

边界：用户取消选择时可能不会触发 `change`，Promise 可能保持 pending；`mutiple` 是历史拼写，调用时不要写成第三方封装里的 `multiple` 命名参数。

### downloadArraybufferFile

```ts
downloadArraybufferFile(
  arraybuffer: ArrayBuffer,
  type: string,
  filename: string,
): void
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `arraybuffer` | `ArrayBuffer` | 无 | 文件内容。 |
| `type` | `string` | 无 | Blob MIME 类型，如 `"application/pdf"`。 |
| `filename` | `string` | 无 | 下载文件名。 |

返回：`void`。

行为：创建 `Blob` 和 Object URL，创建 `a` 标签并设置 `download`，调用 `a.click()` 后立即 `URL.revokeObjectURL(url)`。不修改入参；依赖 `Blob`、`URL`、DOM；副作用是触发下载。

```ts
downloadArraybufferFile(buffer, "application/pdf", "report.pdf");
```

边界：部分浏览器可能要求下载触发发生在用户手势内；URL 会在 click 后立即释放。

### sleep

```ts
sleep(ms: number): Promise<unknown>
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `ms` | `number` | 无 | 延迟毫秒数。 |

返回：`setTimeout` 到期后 resolve 的 Promise，resolve 值未指定。

行为：创建一个定时器。不修改入参；依赖计时器 API；副作用是等待时间流逝。

```ts
await sleep(300);
```

边界：`ms` 小于等于 `0` 时按运行时计时器规则尽快 resolve；不会取消。
