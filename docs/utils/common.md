# Utils common/index

源码路径：`src/utils/index.ts`

该文件是 utils 统一出口，同时定义若干通用工具函数。页面和组件优先从 `@/utils` 导入这里导出的能力。

## 入口转发

| 导出 | 来源 | 说明 |
| --- | --- | --- |
| `copyInfo`、`createImg` | `./module/copy` | 复制文本/图片，创建图片元素。 |
| `formatDate` | `./module/date` | 日期格式化。 |
| `assembleTree`、`eachTree`、`formatTree`、`findTreePath` | `./module/tree` | 树处理。 |
| `getCookie`、`transferDataToQuery`、`transferQueryToData`、`parseJSON` | `./module/parseQuery` | 查询字符串、cookie、JSON 转换。 |
| `formatNum`、`formatMutipleNum`、`formatMoneyPreSubFix`、`rangeNum` | `./module/number` | 数字格式化和范围生成。 |
| `setValue`、`getValue`、`filterObjEmpty` | `./module/object` | 点路径对象读写和空值过滤。 |
| `events` | `./module/subscribe` | 事件总线默认实例。 |

## guid

```ts
guid(): string
```

返回 UUID 风格随机字符串，例如 `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| 无 | - | - | 不接收参数。 |

| 返回值 | 类型 | 说明 |
| --- | --- | --- |
| id | `string` | 基于 `Math.random()` 生成的临时 ID。 |

边界：不保证全局唯一，不适合作为安全 ID。

## debounce

```ts
debounce(event: Function, delay = 300): (...args: unknown[]) => void
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `event` | `Function` | 无 | 延迟执行的函数。 |
| `delay` | `number` | `300` | 防抖等待时间，单位 ms。 |

返回一个函数。连续调用时会清除上一次 timer，只在最后一次调用后延迟执行。

边界：不保留 `this` 类型；返回函数不返回 `event` 的返回值。

## throttle

```ts
throttle(fn: Function, delay = 300): (...args: unknown[]) => void
```

首次调用立即执行，随后 `delay` 时间内忽略后续调用。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `fn` | `Function` | 无 | 被节流函数。 |
| `delay` | `number` | `300` | 节流窗口时间，单位 ms。 |

边界：窗口内最后一次调用不会补执行；不返回 `fn` 的返回值。

## toggleList

```ts
toggleList<T>(list: T[], item: T, customValidate?: (item: T) => boolean): T[]
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `list` | `T[]` | 无 | 要修改的数组。 |
| `item` | `T` | 无 | 要切换的项。 |
| `customValidate` | `(item: T) => boolean` | `undefined` | 自定义匹配函数；未传时用 `===`。 |

行为：找到匹配项则 `splice` 删除，否则 `push` 追加。会修改原数组并返回原数组。

## selectFile

```ts
selectFile(type = "*", mutiple = false): Promise<FileList | null>
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `string` | `"*"` | input accept。 |
| `mutiple` | `boolean` | `false` | 是否多选。参数名按源码拼写为 `mutiple`。 |

行为：创建 `input[type=file]`，设置 `accept` 和 `multiple`，监听 change 后 resolve `input.files`，再调用 `input.click()`。

边界：依赖 DOM；用户取消选择时是否触发 change 取决于浏览器。

## downloadArraybufferFile

```ts
downloadArraybufferFile(arraybuffer: ArrayBuffer, type: string, filename: string): void
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `arraybuffer` | `ArrayBuffer` | 无 | 文件内容。 |
| `type` | `string` | 无 | MIME type。 |
| `filename` | `string` | 无 | 下载文件名。 |

行为：创建 `Blob` 和 object URL，创建临时 `a` 标签并调用 click，随后 `URL.revokeObjectURL(url)`。

## sleep

```ts
sleep(ms: number): Promise<unknown>
```

返回一个在 `ms` 后 resolve 的 Promise。

```ts
await sleep(300);
```
