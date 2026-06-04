# module/parseQuery

源码路径：`src/utils/module/parseQuery.ts`

该模块负责对象、查询字符串、cookie 字符串和 JSON 字符串之间的转换。

## transferDataToQuery

```ts
transferDataToQuery(data: object, isStart = true): string
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `data` | `object` | 无 | 待转换对象。 |
| `isStart` | `boolean` | `true` | 是否添加开头 `?`。 |

行为：

- 遍历对象 key。
- value 为 object 时 `JSON.stringify(value)`。
- value 为 `undefined` 或 `null` 时跳过。
- 每项拼成 `key=value&`。
- 最后删除末尾 `&`。

边界：不做 URL 编码；数组也会按 object JSON 化；空对象返回空字符串。

## parseJSON

```ts
parseJSON(value: string): Record<string, unknown> | string
```

尝试 `JSON.parse(value)`，失败返回原字符串。

边界：类型写成 `Record<string, unknown> | string`，但 JSON 数字、布尔、数组、`null` 解析成功时也会返回。

## transferStringListToData

```ts
transferStringListToData(list: string[]): Record<string, unknown>
```

把形如 `["a=1", "b={\"c\":2}"]` 的字符串数组转成对象。

行为：

- 每项执行 `current.split("=")`。
- 取前两个片段作为 key 和 data。
- value 经 `parseJSON` 转换。

边界：值中包含 `=` 时后续片段会丢失；重复 key 后者覆盖前者。

## transferQueryToData

```ts
transferQueryToData(
  search: string | undefined = location.href.split("?")[1],
): Record<string, unknown>
```

未传 `search` 时读取当前 URL `?` 后面的内容。无查询内容返回 `{}`。

```ts
transferQueryToData("name=tom&pageNum=1");
// { name: "tom", pageNum: 1 }
```

边界：传入 `?a=1` 会得到 key `?a`；不做 URL 解码。

## getCookie

```ts
getCookie(): Record<string, unknown>
```

读取 `document.cookie`，按 `"; "` 拆分后交给 `transferStringListToData`。

边界：依赖浏览器 cookie API；cookie 值包含 `=` 时后续片段会丢失。
