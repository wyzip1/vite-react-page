# module/path

源码路径：`src/utils/module/path.ts`

该模块只导出类型 `Path<T>`，用于在 TypeScript 中生成对象点路径联合类型。

## 类型定义

```ts
type Primitive = null | undefined | symbol | string | number | boolean | bigint;

type PathImpl<K extends string | number, V> = V extends Primitive
  ? `${K}`
  : `${K}` | `${K}.${Path<V>}`;

type ArrayIndex<K> = K extends `${number}` ? K : never;

type IsTuple<T extends Array<unknown>> = number extends T["length"] ? false : true;

type Path<T> = T extends Primitive
  ? never
  : T extends Array<infer V>
    ? IsTuple<T> extends true
      ? { [K in ArrayIndex<keyof T>]: PathImpl<K & string, T[K]> }[ArrayIndex<keyof T>]
      : PathImpl<number, V>
    : { [K in keyof T]: PathImpl<K & string, T[K]> }[keyof T];

export default Path;
```

## 行为

`Path<T>` 是编译期类型，没有运行时代码。它支持：

- 普通对象字段路径。
- 嵌套对象点路径。
- 元组数字下标路径。
- 数组数字下标路径。
- 原始类型终止递归。

## 示例

```ts
type Row = {
  id: number;
  data: {
    money: number;
  };
  tags: string[];
};

type RowPath = Path<Row>;
// "id" | "data" | "data.money" | `tags` | `tags.${number}`
```

## 使用位置

- `EditTableColumn<T>.dataIndex`
- `EditTableColumn<T>.renderIndex`
- `getValue<T>(data, path)`
- `setValue<T>(data, value, path)`

## 边界

- 只提供类型提示，运行时不校验路径。
- 对复杂联合类型、递归类型可能产生较宽或较慢的类型推导。
