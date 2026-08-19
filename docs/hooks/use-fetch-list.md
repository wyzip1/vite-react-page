# useFetchList

`useFetchList` 基于 `useRequest` 管理分页列表。Hook 初始化时只接收请求函数和可选配置；查询参数由每次 `doSearch` 调用传入，并保存为后续翻页使用的最新参数。

## 基础用法

```tsx
const [setPageInfo, state, api] = useFetchList(fetchMockList, {
  pageSize: 20,
});

const search = (formData: SearchFormData) => {
  return api.doSearch({
    body: {
      name: formData.name,
    },
  });
};
```

第二项不再接收查询参数。以下旧用法不再支持：

```ts
// 已废弃
useFetchList(fetchMockList, searchParams, options);
```

## 类型

```ts
interface Pagination {
  pageNum: number;
  pageSize: number;
}

interface FetchListOptions<PN extends string, PS extends string> {
  pageSize?: number;
  manual?: boolean;
  propName?: {
    pageNum?: PN;
    pageSize?: PS;
    total?: string;
    list?: string;
  };
}

interface DoSearchOptions {
  resetPageSize?: boolean;
}
```

返回值结构：

```ts
const [setPageInfo, state, api] = useFetchList(fetchApi, options);
```

## 初始化配置

| 配置 | 默认值 | 说明 |
| --- | --- | --- |
| `pageSize` | `10` | 初始页大小，也是重置页大小时使用的值。 |
| `manual` | `false` | 为真时跳过首次自动请求。 |
| `propName.pageNum` | `"pageNum"` | 请求中的页码字段。 |
| `propName.pageSize` | `"pageSize"` | 请求中的页大小字段。 |
| `propName.total` | `"total"` | 响应中的总数字段。 |
| `propName.list` | `"list"` | 响应中的列表字段。 |

## doSearch

```ts
api.doSearch(params, options?);
```

- `params` 为本次完整查询参数；分页字段由 Hook 注入到 `body` 或 `query`。
- 参数包含 `body` 时，分页字段写入 `body`，否则写入 `query`。
- 每次调用都会保存 `params`，之后 `setPageInfo` 翻页会复用这份最新参数。
- 查询始终把 `pageNum` 重置为 `1`。
- 默认保留当前 `pageSize`。
- `resetPageSize: true` 时，同时把 `pageSize` 恢复为初始化配置值。

普通查询：

```ts
await api.doSearch({ body: searchParams });
```

重置查询条件和页大小：

```ts
await api.doSearch(
  { body: initialSearchParams },
  { resetPageSize: true },
);
```

`refreshList` 已移除。需要重新请求时，再次调用 `doSearch` 并传入当前查询参数。

## setPageInfo

```ts
setPageInfo({ pageNum: 2, pageSize: 20 });
```

分页变化后使用最近一次 `doSearch` 保存的查询参数发起请求。如果分页值没有变化，则直接重新请求，不再返回一个无法结束的 Promise。

## state

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `pageNum` | `number` | 当前页码。 |
| `pageSize` | `number` | 当前页大小。 |
| `total` | `number` | 列表总数。 |
| `loading` | `boolean` | 请求状态。 |
| `list` | `ItemType<T>[]` | 当前列表。 |

## 其他 API

### updateList

```ts
api.updateList(list => {
  list.push(newItem);
});
```

更新内部列表引用，不发起请求。

### resetState

```ts
api.resetState();
```

将页码和页大小恢复为初始值并清空数据，不自动请求。

## 完整示例

```tsx
const [setPageInfo, state, api] = useFetchList(fetchMockList, {
  pageSize: 20,
});

return (
  <>
    <Search
      config={searchOptions}
      loading={state.loading}
      onSearch={values => api.doSearch({ body: values })}
      onReset={values =>
        api.doSearch({ body: values }, { resetPageSize: true })
      }
    />
    <Table
      dataSource={state.list}
      pagination={{
        current: state.pageNum,
        pageSize: state.pageSize,
        total: state.total,
      }}
      onChange={({ current, pageSize }) =>
        setPageInfo({ pageNum: current!, pageSize: pageSize! })
      }
    />
  </>
);
```
