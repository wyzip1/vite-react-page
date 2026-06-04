# 格式化、查询、存储与加密

本页覆盖 date、number、query、storage、jsencrypt 模块的全部导出。

## `src/utils/module/date.ts`

职责：解析日期格式模板，并把日期值格式化为字符串。模块内部依赖 `formatNum` 给月、日、时、分、秒补零。

### parseDateFormatSetting

```ts
parseDateFormatSetting(setting: string): Array<{
  value: "Y" | "M" | "D" | "H" | "m" | "s" | string;
  index: number;
}>
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `setting` | `string` | 无 | 格式模板，如 `"YYYY-MM-DD"`。 |

返回：按字符拆分后的 token 数组。`value` 是当前字符；`index` 是同一字符在模板中第几次出现，从 `0` 开始。

行为：遍历格式字符串，不修改入参；不依赖浏览器 API；无外部副作用。

```ts
parseDateFormatSetting("MM-DD");
// [
//   { value: "M", index: 0 },
//   { value: "M", index: 1 },
//   { value: "-", index: 0 },
//   { value: "D", index: 0 },
//   { value: "D", index: 1 },
// ]
```

边界：按单字符处理，不支持转义语法；非日期字符会作为普通字符记录。

### formatDate

```ts
formatDate(
  value: number | string | Date,
  formatSetting = "YYYY-MM-DD HH:mm:ss",
): string
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `number \| string \| Date` | 无 | 可传时间戳、可被 `new Date` 解析的字符串或 `Date` 实例。 |
| `formatSetting` | `string` | `"YYYY-MM-DD HH:mm:ss"` | 格式模板。支持字符 `Y`、`M`、`D`、`H`、`m`、`s`。 |

返回：格式化后的字符串。

行为：将非 `Date` 值传入 `new Date(value)`；`Y` 从四位年份取对应下标，`M/D/H/m/s` 使用两位补零字符串取对应下标，其他字符原样输出。不修改入参；不依赖浏览器 API；无外部副作用。

```ts
formatDate(new Date("2026-06-04T08:09:10"), "YYYY/MM/DD HH:mm:ss");
// "2026/06/04 08:09:10"

formatDate(0, "YY-M-D"); // "19-0-0"，因为 token 按字符下标截取
```

边界：无效日期会产生 `"NaN"` 或类似片段；模板中同一 token 超出可用长度时会拼接 `undefined`；`YY` 取年份前两位，不是常见的后两位年份。

## `src/utils/module/number.ts`

职责：数字字符串补零、按倍率换算、拆分金额整数/小数、生成连续范围。

### formatNum

```ts
formatNum(num: number, fixed = 2): string
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `num` | `number` | 无 | 要格式化的数字。 |
| `fixed` | `number` | `2` | 目标最小字符长度。 |

返回：长度不足时左侧补 `"0"` 的字符串；长度已达到 `fixed` 时返回原数字字符串。

行为：使用 `num.toString()` 和字符串拼接。不修改入参；不依赖浏览器 API；无外部副作用。

```ts
formatNum(3); // "03"
formatNum(3, 4); // "0003"
formatNum(123, 2); // "123"
```

边界：负数、小数会把 `-` 和 `.` 也计入长度；`fixed <= value.length` 时不截断。

### formatMutipleNum

```ts
formatMutipleNum(
  num: number | undefined | null,
  mutiple = 100,
  forceNumer = true,
  fixed = 2,
): number | string | undefined | null
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `num` | `number \| undefined \| null` | 无 | 要转换的数字；非 number 原样返回。 |
| `mutiple` | `number` | `100` | 除数；为 `0` 时不做除法。参数名按源码拼写为 `mutiple`。 |
| `forceNumer` | `boolean` | `true` | 是否把 `toFixed` 字符串再转回 `Number`。参数名按源码拼写为 `forceNumer`。 |
| `fixed` | `number` | `2` | 小数位数，传给 `toFixed`。 |

返回：`forceNumer` 为 `true` 时返回 `number`；为 `false` 时返回 `string`；`num` 不是数字时返回原值。

行为：计算 `(mutiple === 0 ? num : num / mutiple).toFixed(fixed)`。不修改入参；不依赖浏览器 API；无外部副作用。

```ts
formatMutipleNum(1234); // 12.34
formatMutipleNum(1234, 100, false); // "12.34"
formatMutipleNum(undefined); // undefined
```

边界：`Number("12.00")` 会变成 `12`，尾随 0 会丢失；`fixed` 不在 `toFixed` 支持范围内会抛错。

### formatMoneyPreSubFix

```ts
formatMoneyPreSubFix(num: number, mutiple = 0): string[]
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `num` | `number` | 无 | 金额值。 |
| `mutiple` | `number` | `0` | 传给 `formatMutipleNum` 的除数；默认 `0` 表示不换算。 |

返回：金额字符串按 `"."` 拆分后的数组，如 `["12", "34"]`。

行为：调用 `formatMutipleNum(num, mutiple, false)`，转字符串后 `split(".")`。不修改入参；不依赖浏览器 API；无外部副作用。

```ts
formatMoneyPreSubFix(1234, 100); // ["12", "34"]
formatMoneyPreSubFix(12); // ["12", "00"]
```

边界：默认 `mutiple = 0` 不做除法但仍保留两位小数；返回数组长度通常为 2，但如果上游格式变化则取决于字符串内容。

### rangeNum

```ts
rangeNum(props: {
  start: number;
  end: number;
  format?: boolean;
  afterValue?: string;
}): Array<number | string>
```

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `props.start` | `number` | `0` | 起始值。虽然类型必填，解构默认值为 `0`。 |
| `props.end` | `number` | 无 | 结束值，包含在结果中。 |
| `props.format` | `boolean` | `true` | 是否对每个值调用 `formatNum`。 |
| `props.afterValue` | `string` | `""` | 每项后缀。 |

返回：从 `start` 到 `end` 的连续数组；`format` 或 `afterValue` 会让元素成为字符串。

行为：使用 `Array.from({ length: end - start + 1 })` 生成结果。不修改入参；不依赖浏览器 API；无外部副作用。

```ts
rangeNum({ start: 1, end: 3 }); // ["01", "02", "03"]
rangeNum({ start: 1, end: 3, format: false }); // [1, 2, 3]
rangeNum({ start: 1, end: 3, afterValue: "月" }); // ["01月", "02月", "03月"]
```

边界：`end < start` 时长度小于等于 0 会返回空数组或抛出 RangeError，取决于计算出的 length；很大范围会占用大量内存。

## `src/utils/module/parseQuery.ts`

职责：对象、查询字符串、cookie 字符串和 JSON 字符串之间转换。

### transferDataToQuery

```ts
transferDataToQuery(data: object, isStart = true): string
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `data` | `object` | 无 | 待转换对象。 |
| `isStart` | `boolean` | `true` | 是否在结果前添加 `"?"`。 |

返回：查询字符串。

行为：遍历对象可枚举 key；值为 object 时先 `JSON.stringify`；值为 `undefined` 或 `null` 时跳过；最后去掉末尾 `&`。不修改入参；不依赖浏览器 API；无外部副作用。

```ts
transferDataToQuery({ name: "tom", pageNum: 1 });
// "?name=tom&pageNum=1"

transferDataToQuery({ filter: { a: 1 }, empty: null }, false);
// 'filter={"a":1}'
```

边界：不做 `encodeURIComponent`；数组也会按 object 做 JSON 字符串；空对象返回空字符串而不是 `"?"`。

### parseJSON

```ts
parseJSON(value: string): Record<string, unknown> | string
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | 无 | 待解析字符串。 |

返回：`JSON.parse(value)` 成功时返回解析结果；失败时返回原字符串。

行为：捕获 JSON 解析异常。不修改入参；不依赖浏览器 API；无外部副作用。

```ts
parseJSON('{"a":1}'); // { a: 1 }
parseJSON("abc"); // "abc"
```

边界：类型标注为 `Record<string, unknown> | string`，但 JSON 数字、布尔值、数组、`null` 解析成功时也会被原样返回。

### transferStringListToData

```ts
transferStringListToData(list: string[]): Record<string, unknown>
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `list` | `string[]` | 无 | 形如 `["a=1", "b={\"c\":2}"]` 的键值片段。 |

返回：由 key/value 组成的对象，value 会经过 `parseJSON`。

行为：对每个字符串执行 `current.split("=")`，取前两个片段作为 key 和 data。不修改入参；不依赖浏览器 API；无外部副作用。

```ts
transferStringListToData(["page=1", 'filter={"status":"ok"}']);
// { page: 1, filter: { status: "ok" } }
```

边界：值中包含 `=` 时后续片段会丢失；空字符串会生成 `{"": undefined}`；重复 key 后者覆盖前者。

### transferQueryToData

```ts
transferQueryToData(
  search: string | undefined = location.href.split("?")[1],
): Record<string, unknown>
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `search` | `string \| undefined` | `location.href.split("?")[1]` | 不含前导 `?` 的查询字符串。 |

返回：查询对象；无查询内容时返回 `{}`。

行为：未传参数时读取当前 URL `?` 后第一段；按 `&` 拆分后调用 `transferStringListToData`。不修改入参；默认参数依赖 `location.href`；无写入副作用。

```ts
transferQueryToData("name=tom&pageNum=1");
// { name: "tom", pageNum: 1 }
```

边界：传入 `"?a=1"` 会把 key 解析为 `"?a"`；不做 URL 解码；URL 有多个 `?` 时只取第一个 `?` 后的片段。

### getCookie

```ts
getCookie(): Record<string, unknown>
```

返回：由 `document.cookie` 转换成的对象。

行为：读取 `document.cookie`，按 `"; "` 拆分，再调用 `transferStringListToData`。不修改入参；依赖 DOM cookie API；副作用是读取 cookie。

```ts
const cookies = getCookie();
```

边界：不做 URL 解码；cookie 值中包含 `=` 时后续片段会丢失；没有 cookie 时可能得到 `{"": undefined}`。

## `src/utils/module/storage.ts`

职责：封装 `localStorage`，支持命名空间和可选 RSA 分段加密。模块默认导出实例：

```ts
const storage = new Storage({ namespace: "client", encrypt: true });
export default storage;
```

`Storage` 类未导出，外部通常使用默认实例。

### storage.get

```ts
storage.get(key: string): any
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `key` | `string` | 无 | 业务 key。默认实例实际读取 `client-encrypt-${key}`。 |

返回：不存在时返回 `null`；存在时先解密，再尝试 `JSON.parse`，解析失败返回原字符串。

行为：读取 `localStorage`；默认实例启用加密，会调用 `decryptLong`。不修改入参；依赖 `localStorage`；副作用是读取本地存储。

```ts
const mode = storage.get("theme") || "light";
```

边界：解密失败或数据不是合法 JSON 时可能返回字符串或异常；空字符串会按 falsy 直接返回。

### storage.set

```ts
storage.set(key: string, value: any): void
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `key` | `string` | 无 | 业务 key。默认实例实际写入 `client-encrypt-${key}`。 |
| `value` | `any` | 无 | 要存储的值，会先 `JSON.stringify`。 |

返回：`void`。

行为：默认实例把 JSON 字符串通过 `encryptLong` 加密后写入 `localStorage`。不修改入参；依赖 `localStorage`；副作用是写本地存储。

```ts
storage.set("theme", "dark");
storage.set("user", { id: 1 });
```

边界：`JSON.stringify(undefined)` 返回 `undefined`，传入加密流程可能出错；循环引用会抛错；浏览器存储配额满会抛错。

### storage.remove

```ts
storage.remove(key: string): void
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `key` | `string` | 无 | 要删除的业务 key。 |

返回：`void`。

行为：根据当前实例的 `namespace` 和 `encrypt` 计算真实 key 并调用 `localStorage.removeItem`。不修改入参；依赖 `localStorage`；副作用是删除本地存储项。

```ts
storage.remove("theme");
```

边界：默认实例只删除 `client-encrypt-${key}`，不会删除旧的非加密 `client-${key}`。

### storage.clear

```ts
storage.clear(): void
```

返回：`void`。

行为：调用 `localStorage.clear()`。不修改入参；依赖 `localStorage`；副作用是清空当前 origin 下所有 localStorage，而不只是当前 namespace。

```ts
storage.clear();
```

边界：会影响同域其他业务写入的 localStorage，使用前需要确认范围。

## `src/utils/module/jsencrypt.ts`

职责：使用 `jsencrypt` 和源码内置 RSA 公私钥进行短文本加解密，以及按 12 字符分段处理长字符串。分段连接符是内部常量 `SPLIT_KEY = ":::__:::"`，未导出。

### encrypt

```ts
encrypt(txt: any): string | false
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `txt` | `any` | 无 | 要加密的短文本。 |

返回：加密后的 base64 字符串；失败时返回 `false`。

行为：创建 `JSEncrypt` 实例，设置源码内置公钥，调用 `encryptor.encrypt(txt)`。不修改入参；不依赖浏览器 API；副作用是创建加密器对象。

```ts
const cipher = encrypt("hello");
```

边界：RSA 单次可加密长度有限，长文本应使用 `encryptLong`；传入非字符串依赖 `jsencrypt` 自身处理。

### decrypt

```ts
decrypt(txt: string): any
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `txt` | `string` | 无 | 要解密的密文。 |

返回：解密后的字符串；失败时通常为 `false`。

行为：创建 `JSEncrypt` 实例，设置源码内置私钥，调用 `encryptor.decrypt(txt)`。不修改入参；不依赖浏览器 API；副作用是创建解密器对象。

```ts
const plain = decrypt(cipher as string);
```

边界：返回类型标注为 `any`；密钥不匹配、密文损坏会失败。

### encryptLong

```ts
encryptLong(str: string): string
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `str` | `string` | 无 | 要加密的长字符串。 |

返回：多个 RSA 密文使用 `:::__:::` 拼接后的字符串。

行为：每 12 个字符切一段，分别加密，再 join。不修改入参；不依赖浏览器 API；副作用是创建加密器对象。

```ts
const cipher = encryptLong(JSON.stringify({ token: "abc" }));
```

边界：以 JavaScript 字符串下标切分，emoji 等代理对字符可能被拆开；如果某一段加密失败会被断言为字符串继续拼接。

### decryptLong

```ts
decryptLong(str: string): string
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `str` | `string` | 无 | `encryptLong` 生成的分段密文。 |

返回：拼接后的明文字符串。

行为：按 `:::__:::` 拆分密文，逐段解密并拼接。不修改入参；不依赖浏览器 API；副作用是创建解密器对象。

```ts
const plain = decryptLong(cipher);
```

边界：任何分段解密失败时，当前实现会把 `false` 拼进结果字符串；内置私钥在前端源码中，不能作为生产级安全边界。
