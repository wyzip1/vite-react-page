# 对象、路径类型与树工具

本页覆盖 `src/utils/module/path.ts`、`src/utils/module/object.ts`、`src/utils/module/tree.ts` 的导出。

## `src/utils/module/path.ts`

职责：默认导出 `Path<T>` 类型，用于在 TypeScript 中生成对象点路径联合类型。该文件没有运行时代码。

```ts
import type Path from "@/utils/module/path";

type Row = {
  id: number;
  user: {
    name: string;
    roles: Array<{ code: string }>;
  };
  tuple: [{ value: number }];
};

type RowPath = Path<Row>;
// "id" | "user" | "user.name" | "user.roles" | `user.roles.${number}` |
// `user.roles.${number}.code` | "tuple" | "tuple.0" | "tuple.0.value"
```

类型规则：

| 场景 | 生成规则 |
| --- | --- |
| 原始类型 `null \| undefined \| symbol \| string \| number \| boolean \| bigint` | 不再继续展开；顶层原始类型得到 `never`。 |
| 普通对象 | 每个 key 生成自身路径和递归子路径。 |
| 普通数组 `Array<V>` | 使用数字索引路径，如 `${number}` 和 `${number}.field`。 |
| 元组 | 只使用元组已有数字下标，如 `"0"`、`"1"`。 |

边界：`Path<T>` 只提供编译期提示，运行时不会校验路径存在性；对象包含索引签名或复杂联合类型时，路径联合可能变宽。

## `src/utils/module/object.ts`

职责：按点路径读取/写入对象字段，并过滤对象中的空值字段。`getValue` 和 `setValue` 使用 `Path<T>` 约束路径参数。

### getValue

```ts
getValue<T>(data: T, path?: Path<T>): any
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `data` | `T` | 无 | 被读取的对象、数组或其他值。 |
| `path` | `Path<T> \| undefined` | `undefined` | 点路径，如 `"user.name"`、`"items.0.id"`。 |

返回：路径对应值，找不到路径或未传 `path` 时返回 `undefined`。

行为：按 `path.split(".")` 逐层使用可选链读取。不修改入参；不依赖浏览器 API；无外部副作用。

```ts
const row = { user: { name: "Ada" }, items: [{ id: 1 }] };

getValue(row, "user.name"); // "Ada"
getValue(row, "items.0.id"); // 1
getValue(row); // undefined
```

边界：返回类型是 `any`；路径中包含真实字段名里的 `.` 时无法区分；中间层为 `null` 或 `undefined` 时返回 `undefined`。

### setValue

```ts
setValue<T>(data: T, value: any, path?: Path<T>): T
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `data` | `T` | 无 | 被写入的对象。 |
| `value` | `any` | 无 | 要写入的值。 |
| `path` | `Path<T> \| undefined` | `undefined` | 点路径，如 `"user.name"`。 |

返回：同一个 `data` 引用。

行为：未传 `path` 时直接返回 `data`；传入路径时逐层创建缺失中间对象 `{}`，最后写入目标字段。会修改入参；不依赖浏览器 API；副作用是改写原对象。

```ts
const row: any = {};

setValue(row, 100, "order.amount");
// row: { order: { amount: 100 } }
```

边界：中间层如果存在但不是对象，例如字符串或数字，继续写入可能失败或产生非预期结果；数组路径只按字符串 key 写入，不会自动创建数组。

### filterObjEmpty

```ts
filterObjEmpty(obj: any): any
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `obj` | `any` | 无 | 待过滤对象；空值会原样返回。 |

返回：`obj` 为空时返回原值；否则返回一个新对象，排除值为 `""`、`null`、`undefined` 的字段。

行为：使用 `Object.entries` 和 `Object.fromEntries` 生成新对象。不修改入参；不依赖浏览器 API；无外部副作用。

```ts
filterObjEmpty({ a: "", b: null, c: undefined, d: 0, e: false });
// { d: 0, e: false }
```

边界：只过滤第一层字段；不会过滤空数组、空对象、`false`、`0`、`NaN`。

## `src/utils/module/tree.ts`

职责：提供树结构组装、遍历、转换和路径查找。默认子节点字段为 `"children"` 的函数可以通过 `key` 参数改名。

### assembleTree

```ts
assembleTree<T = any>(
  list: T[],
  key: keyof T,
  parentKey: keyof T,
  children: keyof T,
): T[]
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `list` | `T[]` | 无 | 扁平节点列表。 |
| `key` | `keyof T` | 无 | 当前节点唯一标识字段。 |
| `parentKey` | `keyof T` | 无 | 父节点标识字段。 |
| `children` | `keyof T` | 无 | 写入子节点数组的字段名。 |

返回：根节点数组。根节点定义为其 `key` 没有被其他节点的 `parentKey` 命中的节点。

行为：遍历 `list`，为每个 `item[children]` 赋值为 `list.filter(...)` 的结果。会修改 `list` 中的每个节点对象；不依赖浏览器 API；副作用是给原节点写入子节点字段。

```ts
const list = [
  { id: 1, parentId: 0, name: "root" },
  { id: 2, parentId: 1, name: "child" },
];

const tree = assembleTree(list, "id", "parentId", "children" as never);
```

边界：复杂度约为 O(n²)；不会检测循环引用；如果多个节点 key 相同，结果可能不稳定；所有节点都会被写入 `children` 字段，即使没有子节点也会是空数组。

### eachTree

```ts
eachTree<T = any>(
  tree: T[],
  callback: (item: T) => boolean | undefined | void,
  key = "children",
): T | undefined
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `tree` | `T[]` | 无 | 树根节点数组。 |
| `callback` | `(item: T) => boolean \| undefined \| void` | 无 | 遍历回调；返回真值时停止。 |
| `key` | `string` | `"children"` | 子节点字段名。 |

返回：回调返回真值时返回当前节点；遍历结束未命中时返回 `undefined`。

行为：使用队列数组做广度优先遍历，遇到 `node[key]?.length` 会加入下一层。不修改入参；不依赖浏览器 API；副作用仅来自 callback。

```ts
const target = eachTree(tree, item => item.id === 2);
```

边界：callback 返回任意真值都会停止；树中存在循环引用时可能无限遍历。

### formatTree

```ts
formatTree<T>(
  tree: T[],
  callback: (item: T, children: T[], parent?: any) => any,
  key = "children",
  parent?: any,
): any[]
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `tree` | `T[]` | 无 | 待转换树。 |
| `callback` | `(item: T, children: T[], parent?: any) => any` | 无 | 当前节点转换函数。 |
| `key` | `string` | `"children"` | 子节点字段名。 |
| `parent` | `any` | `undefined` | 内部递归传入的转换后父节点，外部通常不传。 |

返回：转换后的树数组，元素类型为 `any`。

行为：对每个原节点做浅拷贝 `data = { ...node }`，把 `data`、`data[key]`、转换后的父节点传给 callback；如果 callback 返回值 `value[key]` 存在，则递归转换它。不会修改原节点对象本身，但返回值中的子节点字段会被递归结果替换；不依赖浏览器 API；副作用仅来自 callback。

```ts
const options = formatTree(categoryTree, (item, children) => ({
  label: item.name,
  value: item.id,
  children,
}));
```

边界：callback 必须返回对象且需要保留子节点字段，递归才会继续；浅拷贝不会复制深层对象；循环树会递归溢出。

### findTreePath

```ts
findTreePath<T = any>(
  tree: T[],
  callback: (item: T) => boolean | undefined,
  key = "children",
  path: T[] = [],
): T[] | undefined
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `tree` | `T[]` | 无 | 树根节点数组。 |
| `callback` | `(item: T) => boolean \| undefined` | 无 | 命中判断函数。 |
| `key` | `string` | `"children"` | 子节点字段名。 |
| `path` | `T[]` | `[]` | 内部递归路径，外部通常不传。 |

返回：从根节点到命中节点的节点数组；未命中返回 `undefined`。

行为：深度优先遍历，每层复制当前路径再追加节点。不修改入参；不依赖浏览器 API；副作用仅来自 callback。

```ts
const path = findTreePath(tree, item => item.id === targetId);
const names = path?.map(item => item.name);
```

边界：只返回第一个命中路径；callback 返回 `false` 或 `undefined` 都视为未命中；循环树会递归溢出。
