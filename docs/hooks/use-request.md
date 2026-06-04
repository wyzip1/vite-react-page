# useRequest

`useRequest` 位于 `src/hooks/useRequest.ts`，职责是包装一个返回 Promise 的请求函数，统一维护请求触发、响应数据、loading 状态、手动数据改写和 axios cancel token 取消逻辑。

## 类型

```ts
import type { CancelTokenSource } from "axios";

export type RequestResult<T> = T extends (...args: any[]) => Promise<infer V> ? V : never;

function useRequest<T extends (...args: any[]) => Promise<any>>(
  requestApi: T,
  options?: {
    params?: Parameters<T>[0] | undefined;
    manual?: boolean;
  },
  handlerData?: (data: RequestResult<T>) => any,
): [
  (params: Parameters<T>[0]) => Promise<RequestResult<T>>,
  RequestResult<T> | undefined,
  boolean,
  React.Dispatch<
    React.SetStateAction<(Omit<RequestResult<T>, "data"> & { data?: any }) | undefined>
  >,
  () => void,
]
```

## 参数

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `requestApi` | `T extends (...args: any[]) => Promise<any>` | 无 | 实际请求函数。当前实现会调用 `requestApi({ cancelToken, ...params })`，因此请求函数应接受对象参数。 |
| `options.params` | `Parameters<T>[0] \| undefined` | `undefined` | 自动请求时使用的初始参数。只有 `manual !== true` 且 `params` 为真值时才会自动请求。 |
| `options.manual` | `boolean \| undefined` | `undefined`，按 `false` 处理 | 是否手动触发。为 `true` 时挂载后不自动请求，即使传入 `params`。 |
| `handlerData` | `(data: RequestResult<T>) => any` | `undefined` | 请求成功后执行的数据处理函数。注意当前源码对返回值的赋值逻辑见下文。 |

## 返回 tuple

| 下标 | 名称 | 类型 | 说明 |
| --- | --- | --- | --- |
| `0` | `request` | `(params: Parameters<T>[0]) => Promise<RequestResult<T>>` | 手动发起请求。会设置 `loading=true`，向请求参数注入当前 `cancelToken`，请求完成后在 `finally` 中设置 `loading=false`。 |
| `1` | `data` | `RequestResult<T> \| undefined` | 当前保存的响应数据，初始值为 `undefined`。 |
| `2` | `loading` | `boolean` | 是否有当前 `request` 正在执行，初始值为 `false`。 |
| `3` | `setData` | `React.Dispatch<React.SetStateAction<(Omit<RequestResult<T>, "data"> & { data?: any }) \| undefined>>` | 手动改写 `data`。源码返回时使用了 `as any`，方便外部做局部结构替换。 |
| `4` | `cancelRequest` | `() => void` | 调用 `CancelTokenSource.cancel()` 取消当前 token，并立即重建新的 token source。 |

## 默认值与生命周期

- `loading` 初始为 `false`，`data` 初始为 `undefined`。
- `cancelTokenSourceRef` 初始化时创建一次 `axios.CancelToken.source()`。
- 首次挂载执行一次 effect，依赖数组为空。
- `options.manual === true` 时不自动请求，effect 仍返回 `cancelRequest`，组件卸载时会取消当前 token。
- `options.manual !== true` 且 `options.params` 为真值时，挂载后执行 `request(options.params)`。
- 未传 `params` 时不会自动请求。
- 组件卸载时调用 `cancelRequest`。

## manual 行为

```ts
const [request, data, loading] = useRequest(fetchDetail, {
  manual: true,
  params: { query: { id } },
});
```

上例不会在挂载时请求，因为 `manual: true` 优先级高于 `params`。需要显式调用：

```ts
await request({ query: { id } });
```

自动请求写法：

```ts
const [, data, loading] = useRequest(fetchDetail, {
  params: { query: { id } },
});
```

## 请求取消

`request` 会把当前 token 放入请求参数：

```ts
requestApi({
  cancelToken: cancelTokenSourceRef.current.token,
  ...params,
});
```

取消规则：

- `cancelRequest()` 会取消当前 token，并创建新的 `CancelTokenSource`，后续请求使用新 token。
- 组件卸载时会自动调用 `cancelRequest()`。
- 如果 `params` 自身包含 `cancelToken`，由于展开顺序在后，外部传入的 `cancelToken` 会覆盖 hook 注入的 token。
- 只有 `requestApi` 把 `cancelToken` 继续传给 axios 请求时，取消才会真正中断请求。
- 请求取消不会被 hook 内部捕获，`request` 返回的 Promise 会按 axios 行为 reject；`loading` 仍会在 `finally` 中恢复为 `false`。

## handlerData 当前行为

源码逻辑是：

```ts
if (handlerData) {
  const value = handlerData(res);
  setData(value ? res : value);
} else {
  setData(res);
}
```

这意味着：

- 未传 `handlerData` 时，`data` 保存原始响应 `res`。
- 传入 `handlerData` 后，如果 `handlerData(res)` 返回真值，`data` 仍保存原始响应 `res`。
- 如果 `handlerData(res)` 返回假值，例如 `undefined`、`null`、`false`、`0`、`""`，`data` 保存该假值。
- `request` 的 Promise 始终 resolve 原始响应 `res`，不返回转换后的值。

如果业务期望 `data` 保存转换结果，需要主线程确认是否要调整源码；当前文档按现有实现描述。

## 示例

```ts
type DetailParams = {
  query: { id: string };
  cancelToken?: CancelTokenSource["token"];
};

type DetailResponse = {
  code: number;
  data?: { id: string; name: string };
};

const fetchDetail = (params: DetailParams) => {
  return axiosInstance({
    url: "/api/detail",
    method: "GET",
    params: params.query,
    cancelToken: params.cancelToken,
  }) as Promise<DetailResponse>;
};

const [request, detailRes, loading, setDetailRes, cancelRequest] = useRequest(fetchDetail, {
  manual: true,
});

async function load(id: string) {
  const res = await request({ query: { id } });
  setDetailRes(current => ({
    ...current,
    data: res.data,
  }));
}
```

## 边界条件

- `requestApi` 如果不接受对象参数，`requestApi({ cancelToken, ...params })` 会与函数签名不匹配。
- 多次并发调用 `request` 会共享同一个 cancel token；调用 `cancelRequest` 会取消使用该 token 的所有未完成请求。
- hook 不维护请求序号，后完成的旧请求可能覆盖先完成的新请求数据。
- effect 依赖被显式禁用，`requestApi`、`options.params`、`handlerData` 的引用变化不会触发自动重跑。
- `handlerData` 抛错会让 `request` reject，并进入 `finally` 恢复 `loading`。
