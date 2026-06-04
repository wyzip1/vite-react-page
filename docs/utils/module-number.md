# module/number

源码路径：`src/utils/module/number.ts`

该模块提供数字补零、倍率换算、金额拆分和范围生成。

## formatNum

```ts
formatNum(num: number, fixed = 2): string
```

数字转字符串后，长度不足 `fixed` 时左侧补 0。

```ts
formatNum(3); // "03"
formatNum(3, 4); // "0003"
formatNum(123, 2); // "123"
```

## formatMutipleNum

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
| `num` | `number \| undefined \| null` | 无 | 非 number 原样返回。 |
| `mutiple` | `number` | `100` | 除数；为 0 时不除。源码拼写为 `mutiple`。 |
| `forceNumer` | `boolean` | `true` | 是否把 `toFixed` 字符串转回 Number。源码拼写为 `forceNumer`。 |
| `fixed` | `number` | `2` | 小数位数。 |

```ts
formatMutipleNum(1234); // 12.34
formatMutipleNum(1234, 100, false); // "12.34"
```

边界：转 Number 会丢失尾随 0；`fixed` 超出 `toFixed` 支持范围会抛错。

## formatMoneyPreSubFix

```ts
formatMoneyPreSubFix(num: number, mutiple = 0): string[]
```

调用 `formatMutipleNum(num, mutiple, false)` 后按 `.` 分割。

```ts
formatMoneyPreSubFix(1234, 100); // ["12", "34"]
formatMoneyPreSubFix(12); // ["12", "00"]
```

## rangeNum

```ts
rangeNum({
  start,
  end,
  format = true,
  afterValue = "",
}: {
  start: number;
  end: number;
  format?: boolean;
  afterValue?: string;
}): Array<number | string>
```

生成包含 `start` 和 `end` 的连续数组。

```ts
rangeNum({ start: 1, end: 3 }); // ["01", "02", "03"]
rangeNum({ start: 1, end: 3, format: false }); // [1, 2, 3]
rangeNum({ start: 1, end: 3, afterValue: "月" }); // ["01月", "02月", "03月"]
```

边界：`end < start` 时 length 为非正数，可能返回空数组或抛出 RangeError。
