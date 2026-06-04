# module/storage

源码路径：`src/utils/module/storage.ts`

该模块封装 `localStorage`，支持 namespace 和可选 RSA 分段加密。默认导出实例：

```ts
const storage = new Storage({ namespace: "client", encrypt: true });
export default storage;
```

`Storage` 类当前没有导出。

## 构造参数

```ts
constructor({ namespace, encrypt }: { namespace: string; encrypt?: boolean })
```

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `namespace` | `string` | 是 | 无 | key 前缀。 |
| `encrypt` | `boolean` | 否 | `false` | 是否启用 `encryptLong/decryptLong`。 |

默认实例真实 key：

```text
client-encrypt-${key}
```

## get

```ts
storage.get(key: string): any
```

行为：

- 加密实例读取 `${namespace}-encrypt-${key}`。
- 非加密实例读取 `${namespace}-${key}`。
- 加密实例读取后调用 `decryptLong(value)`。
- 如果 value 存在，尝试 `JSON.parse(value)`。
- JSON 解析失败返回原字符串。
- 不存在时返回 `null`。

## set

```ts
storage.set(key: string, value: any): void
```

行为：

- 先 `JSON.stringify(value)`。
- 加密实例调用 `encryptLong(data)` 后写入。
- 非加密实例直接写入 JSON 字符串。

边界：`undefined`、循环引用、超出 localStorage 配额都可能导致异常。

## remove

```ts
storage.remove(key: string): void
```

删除当前实例规则下的真实 key：

```ts
`${namespace}${encrypt ? "-encrypt-" : "-"}${key}`
```

默认实例只删除 `client-encrypt-${key}`。

## clear

```ts
storage.clear(): void
```

直接调用 `localStorage.clear()`。

边界：会清空当前 origin 下所有 localStorage，不只清当前 namespace。

## 示例

```ts
storage.set("theme", "dark");
const mode = storage.get("theme");
storage.remove("theme");
```

## 风险

- 加密密钥在前端源码中，不能作为安全边界。
- 默认实例依赖浏览器 `localStorage`，不适合 SSR。
