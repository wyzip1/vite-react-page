# useFetchList

`useFetchList` 位于 `src/hooks/useFetchList.ts`，职责是在 `useRequest` 基础上封装分页列表。它维护页码、页大小、列表、总数和 loading，并提供搜索、翻页、刷新、重置和本地列表更新方法。

## 类型

```ts
export interface Pagination {
  pageNum: number;
  pageSize: number;
}

export interface List<T> {
  list?: T[];
  total?: number;
}

export type ItemType<T> = T extends (...args: any[]) => Promise<{ data?: List<infer V> }>
  ? V
  : never;

function useFetchList<
  T extends (...args: any[]) => Promise<{ data?: List<any> }>,
  PN extends string = "pageNum",
  PS extends string = "pageSize",
>(
  fetchApi: T,
  searchParams: Omit<Parameters<T>[0], "query" | "body"> & {
    query?: Omit<Parameters<T>[0]["query"], PN | PS>;
    body?: Omit<Parameters<T>[0]["body"], PN | PS>;
  },
  defaultOptions?: {
    pageSize?: number;
    manual?: boolean;
    propName?: {
      pageNum?: PN;
      pageSize?: PS;
      total?: string;
      list?: string;
    };
  },
): [
  (pageOptions: Pagination) => ReturnType<T>,
  {
    pageNum: number;
    pageSize: number;
    total: number;
    loading: boolean;
    list: Array<ItemType<T>>;
  },
  {
    doSearch: () => ReturnType<T>;
    updateList: (callback?: ((list: Array<ItemType<T>>) => void) | undefined) => void;
    refreshList: () => ReturnType<T>;
    resetState: () => void;
  },
]
```

源码中第三个参数默认值是 `{ manual: false }`。如果调用时传入对象但省略某些字段，对应字段按 `undefined` 处理。

## 参数

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `fetchApi` | `T extends (...args: any[]) => Promise<{ data?: List<any> }>` | 无 | 列表请求函数。内部通过 `useRequest(fetchApi, { manual: true })` 调用。 |
| `searchParams` | `Omit<Parameters<T>[0], "query" \| "body"> & { query?: Omit<Parameters<T>[0]["query"], PN \| PS>; body?: Omit<Parameters<T>[0]["body"], PN \| PS> }` | 无 | 基础查询参数。分页字段由 hook 注入到 `query` 或 `body`，因此类型上会从外部参数中排除分页字段。 |
| `defaultOptions.pageSize` | `number \| undefined` | `10` | 初始和重置后的每页条数。 |
| `defaultOptions.manual` | `boolean \| undefined` | `false` | 是否跳过首次请求。 |
| `defaultOptions.propName.pageNum` | `PN \| undefined` | `"pageNum"` | 写入请求参数的页码字段名。 |
| `defaultOptions.propName.pageSize` | `PS \| undefined` | `"pageSize"` | 写入请求参数的页大小字段名。 |
| `defaultOptions.propName.total` | `string \| undefined` | `"total"` | 从响应 `data` 中读取总数字段名。 |
| `defaultOptions.propName.list` | `string \| undefined` | `"list"` | 从响应 `data` 中读取列表字段名。 |

## 响应结构

默认响应结构：

```ts
{
  data?: {
    list?: T[];
    total?: number;
  };
}
```

返回给页面的 `state.list` 和 `state.total` 实际读取路径是：

```ts
const total = response?.data?.[propName.total || "total"] || 0;
const list = response?.data?.[propName.list || "list"] || [];
```

如果接口字段不同，可以通过 `propName` 映射：

```ts
const [setPageInfo, state, api] = useFetchList(fetchApi, params, {
  pageSize: 20,
  propName: {
    pageNum: "current",
    pageSize: "size",
    total: "count",
    list: "records",
  },
});
```

对应响应应保持列表容器在 `data` 内：

```ts
{
  data: {
    records: [],
    count: 0
  }
}
```

## 分页字段写入规则

`onSearch(pageNum, pageSize)` 会浅拷贝 `searchParams`：

```ts
const params: Parameters<T>[0] = {
  ...searchParams,
};
```

然后选择分页字段位置：

- 如果 `params.body` 存在，分页字段写入 `body`。
- 否则分页字段写入 `query`。
- 如果目标对象不存在，会创建空对象。
- 页码字段名默认是 `pageNum`，页大小字段名默认是 `pageSize`。
- 因为只浅拷贝顶层对象，已有的 `query` 或 `body` 对象会被原地追加或覆盖分页字段。

示例：

```ts
const searchParams = {
  body: {
    name: "Alice",
  },
};

// 请求时 body 会变成：
{
  name: "Alice",
  pageNum: 1,
  pageSize: 10,
}
```

## 返回 tuple

### 0. setPageInfo

源码返回的第一个值是 `updateParams`，页面通常命名为 `setPageInfo`：

```ts
const [setPageInfo, state, api] = useFetchList(fetchMockList, searchParams);
```

类型：

```ts
(pageOptions: Pagination) => ReturnType<T>
```

行为：

- 调用时保存一个内部 `resolve/reject` 引用到 `pageChangeRequestRef`。
- 使用 `setPageNum(pageOptions.pageNum || pageNum)` 更新页码。
- 使用 `setPageSize(pageOptions.pageSize || pageSize)` 更新页大小。
- 页码或页大小变化后，effect 会发起请求，并把请求结果转交给 `setPageInfo` 返回的 Promise。

边界：

- `pageNum` 或 `pageSize` 传 `0` 会被 `||` 视为无效，回退到当前值。
- 如果传入的页码和页大小与当前 state 完全相同，React 可能不会触发 effect，返回的 Promise 可能不会 resolve/reject。

### 1. state

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `pageNum` | `number` | `1` | 当前页码。 |
| `pageSize` | `number` | `defaultOptions.pageSize || 10` | 当前每页条数。 |
| `total` | `number` | `0` | 从 `data?.data?.[totalField]` 读取，总数不存在时为 `0`。 |
| `loading` | `boolean` | `false` | 来自内部 `useRequest`。 |
| `list` | `Array<ItemType<T>>` | `[]` | 从 `data?.data?.[listField]` 读取，列表不存在时为空数组。 |

### 2. api

| 方法 | 类型 | 说明 |
| --- | --- | --- |
| `doSearch` | `() => ReturnType<T>` | 查询当前条件。如果当前在第 1 页，直接请求第 1 页；否则先把页码切回 1，并返回翻页触发请求的 Promise。 |
| `updateList` | `(callback?: (list: Array<ItemType<T>>) => void) => void` | 手动触发内部 `data` 浅拷贝，常用于外部已原地修改列表后刷新引用。当前源码传给 callback 的是 `data?.[listField] || []`，不是 `data?.data?.[listField]`。 |
| `refreshList` | `() => ReturnType<T>` | 使用当前 `pageNum` 和 `pageSize` 重新请求。 |
| `resetState` | `() => void` | 把页码重置为 `1`、页大小重置为默认值，并清空内部 `data`。 |

## manual、生命周期与清理

- `useFetchList` 内部固定调用 `useRequest(fetchApi, { manual: true })`，请求由列表 hook 自己控制。
- 初始 `pageNum=1`，`pageSize=defaultOptions.pageSize || 10`。
- effect 依赖是 `[pageNum, pageSize]`。
- `defaultOptions.manual` 为真时，首次 effect 只把 `initRef.current` 置为 `false`，不会请求。
- `defaultOptions.manual` 为假或未传时，首次 effect 会请求第 1 页。
- 页码或页大小变化时会请求新分页。
- `resetState()` 会清空数据。如果当前分页不是默认分页，会设置 `isResetRef.current=true`，下一次分页 effect 会被跳过，因此重置本身不会自动请求。
- 组件卸载时，内部 `useRequest` 会取消当前 cancel token。

## 请求取消

`useFetchList` 没有把 `cancelRequest` 暴露给调用方。取消能力来自内部 `useRequest`：

- 组件卸载时会取消内部 cancel token。
- 翻页、搜索、刷新时不会自动取消上一次未完成请求。
- 多个列表请求如果并发进行，会共享内部 `useRequest` 当前 token。
- 请求函数必须把 `cancelToken` 传给 axios，请求取消才有效。

## 使用示例

```tsx
interface SearchFormData {
  name?: string;
}

const searchParams = useMemo(
  () => ({
    body: {
      name: searchFormData.name,
    },
  }),
  [searchFormData.name],
);

const [setPageInfo, state, api] = useFetchList(fetchMockList, searchParams, {
  pageSize: 20,
});

return (
  <Table
    rowKey="id"
    dataSource={state.list}
    loading={state.loading}
    pagination={{
      current: state.pageNum,
      pageSize: state.pageSize,
      total: state.total,
    }}
    onChange={({ current, pageSize }) => {
      setPageInfo({ pageNum: current!, pageSize: pageSize! });
    }}
  />
);
```

搜索：

```ts
function onSearch() {
  api.doSearch();
}
```

刷新当前页：

```ts
await api.refreshList();
```

本地修改列表引用：

```ts
function saveRecord(record: ItemType<typeof fetchMockList>) {
  const idx = state.list.findIndex(item => item.id === record.id);
  if (idx > -1) state.list[idx] = record;
  else state.list.push(record);
  api.updateList();
}
```

## 边界条件

- `searchParams` 的 `query` 或 `body` 会被写入分页字段；如果它来自 memo 或外部状态对象，需要接受该对象会被原地补充分页字段。
- `doSearch()` 在非第一页时只是切页到 1，真正请求由 effect 触发。
- `resetState()` 只重置状态和清空数据，不自动拉取默认页。
- `updateList(callback)` 的 callback 参数读取路径与 `state.list` 读取路径不一致；标准响应 `{ data: { list } }` 下 callback 默认会收到空数组。
- hook 不处理请求乱序问题，快速翻页时较晚返回的旧请求可能覆盖较新的列表数据。
- effect 中禁用了依赖 lint，`fetchApi`、`searchParams`、`defaultOptions` 引用变化不会直接触发重新请求，除非页码或页大小变化。
