# module/jsencrypt

源码路径：`src/utils/module/jsencrypt.ts`

该模块基于 `jsencrypt` 提供 RSA 加解密。公钥和私钥都写在前端源码中。

## 常量

| 常量 | 类型 | 说明 |
| --- | --- | --- |
| `SPLIT_KEY` | `string` | 长文本分段密文连接符，值为 `:::__:::`。 |
| `publicKey` | `string` | 内置 RSA 公钥。 |
| `privateKey` | `string` | 内置 RSA 私钥。 |

## encrypt

```ts
encrypt(txt: any): string | false
```

创建 `JSEncrypt` 实例，设置公钥后调用 `encryptor.encrypt(txt)`。

边界：RSA 单次可加密长度有限，过长内容可能返回 `false`。

## decrypt

```ts
decrypt(txt: string): any
```

创建 `JSEncrypt` 实例，设置私钥后调用 `encryptor.decrypt(txt)`。

## encryptLong

```ts
encryptLong(str: string): string
```

行为：

- 每 12 个字符切一段。
- 每段调用 `encrypt.encrypt(value)`。
- 使用 `SPLIT_KEY` 拼接密文。

```ts
const cipher = encryptLong(JSON.stringify({ token: "abc" }));
```

边界：如果某段加密返回 `false`，源码强制断言为 string，可能产生非预期结果。

## decryptLong

```ts
decryptLong(str: string): string
```

行为：

- 使用 `SPLIT_KEY` 拆分密文。
- 每段调用 `decrypt.decrypt(keys[i])`。
- 拼接明文。

## 风险

- 公私钥都在前端源码中，任何用户都可以读取。
- 只能作为弱保护或示例能力，不应用作真正安全边界。
- 加密按字符串长度分段，不按字节长度处理。
