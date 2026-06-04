# module/tree

源码路径：`src/utils/module/tree.ts`

该模块提供树组装、遍历、转换和路径查找。

## assembleTree

```ts
assembleTree<T = any>(
  list: T[],
  key: keyof T,
  parentKey: keyof T,
  children: keyof T,
): T[]
```

把扁平数组组装成树。会给每个 item 写入 `children` 字段，因此会修改原数组中的对象。

```ts
assembleTree(list, "id", "parentId", "children");
```

边界：实现中每个节点都会 `filter` 全量 list，复杂度较高；如果有重复 key 或循环父子关系，结果不可预测。

## eachTree

```ts
eachTree<T = any>(
  tree: T[],
  callback: (item: T) => boolean | undefined | void,
  key = "children",
): T | undefined
```

广度遍历树。callback 返回真值时停止并返回当前节点。

```ts
const node = eachTree(tree, item => item.id === targetId);
```

边界：默认子节点字段是 `"children"`；不捕获 callback 异常。

## formatTree

```ts
formatTree<T>(
  tree: T[],
  callback: (item: T, children: T[], parent?: any) => any,
  key = "children",
  parent?: any,
): any[]
```

递归转换树节点。每个节点先浅拷贝，再传给 callback。

```ts
const options = formatTree(tree, item => ({
  label: item.name,
  value: item.id,
  children: item.children,
}));
```

边界：如果 callback 返回值没有 `children` 字段，就不会递归；浅拷贝不保护嵌套对象。

## findTreePath

```ts
findTreePath<T = any>(
  tree: T[],
  callback: (item: T) => boolean | undefined,
  key = "children",
  path: T[] = [],
): T[] | undefined
```

深度优先查找符合条件的节点，并返回从根到目标节点的路径。

```ts
const path = findTreePath(tree, item => item.id === targetId);
```

边界：找不到返回 `undefined`；不处理循环引用。
