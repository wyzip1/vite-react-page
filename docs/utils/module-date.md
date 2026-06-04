# module/date

源码路径：`src/utils/module/date.ts`

该模块负责解析日期格式模板，并格式化日期值。

## DateFormatSetting

```ts
interface DateFormatSetting {
  value: "Y" | "M" | "D" | "H" | "m" | "s" | string;
  index: number;
}
```

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `value` | 日期 token 或普通字符 | 当前字符。 |
| `index` | `number` | 同一字符在模板中第几次出现，从 0 开始。 |

## parseDateFormatSetting

```ts
parseDateFormatSetting(setting: string): DateFormatSetting[]
```

逐字符解析模板：

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

边界：不支持转义语法；普通字符也会进入结果。

## formatDate

```ts
formatDate(
  value: number | string | Date,
  formatSetting = "YYYY-MM-DD HH:mm:ss",
): string
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `number \| string \| Date` | 无 | 日期值；非 Date 会传给 `new Date(value)`。 |
| `formatSetting` | `string` | `"YYYY-MM-DD HH:mm:ss"` | 格式模板。 |

支持字符：

| 字符 | 来源 |
| --- | --- |
| `Y` | `date.getFullYear().toString()` |
| `M` | `formatNum(date.getMonth() + 1)` |
| `D` | `formatNum(date.getDate())` |
| `H` | `formatNum(date.getHours())` |
| `m` | `formatNum(date.getMinutes())` |
| `s` | `formatNum(date.getSeconds())` |

示例：

```ts
formatDate(new Date("2026-06-04T08:09:10"), "YYYY/MM/DD HH:mm:ss");
// "2026/06/04 08:09:10"
```

边界：

- `YY` 取年份字符串前两位，不是后两位。
- token 次数超过字符串长度时可能拼入 `undefined`。
- 无效日期会产生 `NaN` 片段。
