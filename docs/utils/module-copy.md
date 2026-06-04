# module/copy

源码路径：`src/utils/module/copy.ts`

该模块负责复制文本、图片或 DOM 节点，并使用 Ant Design `message` 提示结果。

## createImg

```ts
createImg(url: string): Promise<HTMLImageElement>
```

创建 `img` 元素，设置：

```ts
img.src = url;
img.crossOrigin = "Anonymous";
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `url` | `string` | 无 | 图片地址。 |

返回：图片加载成功 resolve `HTMLImageElement`，失败 reject error event。

## copyToEl

```ts
copyToEl(el: Element): void
```

行为：

1. 获取 `window.getSelection()`。
2. 清空当前 selection。
3. 创建 range。
4. 把传入元素 append 到 `document.body`。
5. `range.selectNode(el)` 并 `selection.addRange(range)`。
6. 调用 `document.execCommand("copy")`。
7. 从 body 移除元素。

副作用：临时修改 DOM 和 selection。

## copyText

```ts
copyText(data: string): Promise<void>
```

行为：

- 查询 `navigator.permissions.query({ name: "clipboard-write" })`。
- 权限为 `granted` 时使用 `navigator.clipboard.writeText(data)`。
- 否则创建 `span`，设置 `innerText`，调用 `copyToEl(span)`。

边界：依赖浏览器 Clipboard/Permissions API；部分浏览器权限名支持不一致。

## copyImg

```ts
copyImg(data: { type: "img"; url: string }): Promise<void>
```

行为：

- 权限为 `granted` 时 fetch 图片 blob，并写入 `navigator.clipboard.write([new ClipboardItem(...)])`。
- 否则调用 `createImg(data.url)`，再 `copyToEl(img)`。

边界：跨域图片依赖 CORS；ClipboardItem 兼容性有限。

## copyInfo

```ts
copyInfo(data?: string | { type: "img"; url: string }): Promise<void>
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `data` | `string \| { type: "img"; url: string } \| undefined` | `undefined` | 文本或图片复制配置。 |

行为：

- 未传 `data` 时直接返回。
- 字符串调用 `copyText(data)`。
- 图片配置调用 `copyImg(data)`。
- 同步 try/catch 中立即调用 `message.success("复制成功")`。
- catch 中打印 `copy error:` 并 `message.error("复制失败")`。

边界：当前实现没有 `await copyText/copyImg`，异步复制失败可能不会进入 `copyInfo` 的 catch。
