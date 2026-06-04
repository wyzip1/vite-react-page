# module/object

源码路径：`src/utils/module/object.ts`

该模块负责对象点路径读取、写入和空值过滤。

## getValue

```ts
getValue<T>(data: T, path?: Path<T>): any
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `data` | `T` | 无 | 源对象。 |
| `path` | `Path<T>` | `undefined` | 点路径，如 `data.money`。 |

行为：按 `path.split(".")` 逐层读取。

```ts
getValue({ data: { money: 100 } }, "data.money"); // 100
```

边界：未传 path 返回 `undefined`；中间层不存在时返回 `undefined`。

## setValue

```ts
setValue<T>(data: T, value: any, path?: Path<T>): T
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `data` | `T` | 无 | 要修改的对象。 |
| `value` | `any` | 无 | 写入值。 |
| `path` | `Path<T>` | `undefined` | 点路径。 |

行为：中间路径不存在时创建 `{}`，最后写入目标字段。会修改原对象并返回原对象。

```ts
const row = {};
setValue(row, 100, "data.money");
// row = { data: { money: 100 } }
```

边界：未传 path 直接返回原对象；路径中遇到非对象值时可能运行异常或覆盖行为不符合预期。

## filterObjEmpty

```ts
filterObjEmpty(obj: any): any
```

过滤对象中值为 `""`、`null`、`undefined` 的字段。

```ts
filterObjEmpty({ a: "", b: null, c: undefined, d: 1 });
// { d: 1 }
```

边界：只过滤对象第一层；不会递归；传入 falsy 值直接返回。
