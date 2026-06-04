# DropFolderUpload

源码路径：

- `src/components/DropFolderUpload/index.tsx`
- `src/components/DropFolderUpload/utils.ts`

`DropFolderUpload` 基于 Ant Design `Upload.Dragger`，用于图片拖拽上传，支持文件夹递归读取、前端校验、图片预览和自定义上传请求。

## 类型

```ts
import type { UploadProps } from "antd";
import type { AxiosRequestConfig } from "axios";
import type { RequestResponse } from "@/api/config";

export type UploadRequestApi = (params: {
  data: FormData;
  onUploadProgress?: AxiosRequestConfig["onUploadProgress"];
}) => Promise<RequestResponse<any>>;

type DropFolderUploadProps = UploadProps & {
  fileValide?: (file: File) => string;
  requestApi?: UploadRequestApi;
};
```

## Props

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `fileValide` | `(file: File) => string` | 否 | `undefined` | 文件校验函数。返回非空字符串代表错误文案。字段名按源码拼写为 `fileValide`。 |
| `requestApi` | `UploadRequestApi` | 否 | `undefined` | 自定义上传请求，传给 `customRequest`。 |
| `name` | `string` | 否 | `customRequest` 中默认为 `"file"` | `FormData.append(name, file)` 的字段名。 |
| `fileList` | `UploadProps["fileList"]` | 否 | 内部 `fileList` | 传入后展示使用受控列表。 |
| `onChange` | `UploadProps["onChange"]` | 否 | `undefined` | 选择、删除、拖拽添加文件后触发。 |
| `onRemove` | `UploadProps["onRemove"]` | 否 | `undefined` | 删除文件时触发。 |
| 其他 UploadProps | `UploadProps` | 否 | Ant Design 默认值 | 最终 `{...props}` 后展开，可能覆盖组件预设事件。 |

组件预设：

| 字段 | 值 |
| --- | --- |
| `listType` | `"picture"` |
| `accept` | `"image/*"` |
| `multiple` | `true` |
| `beforeUpload` | `() => false` |
| `customRequest` | `options => customRequest({ ...options, name, requestApi })` |

## 内部状态

| 状态 | 类型 | 初始值 | 说明 |
| --- | --- | --- | --- |
| `fileList` | `UploadFile<any>[]` | `[]` | 非受控文件列表。 |
| `previewImage` | `string` | `""` | 非空时打开 Ant Design `Image` 预览。 |

## 工具函数

### dropImageFileHandle

```ts
dropImageFileHandle(dataList: any): Promise<File[]>
```

遍历拖拽项，只处理 `kind === "file"` 的项；调用 `getAsFileSystemHandle()` 后交给 `treaverDir` 递归读取图片。

### treaverDir

```ts
treaverDir(dirHandle: any): Promise<File[]>
```

- `dirHandle.kind === "file"` 时读取单个文件，只保留 MIME 为 `image/*` 的文件。
- 目录时遍历 `entries()`，递归读取子目录。

### customRequest

```ts
customRequest(props: CustomRequestProps): Promise<void>
```

行为：

1. 创建 `FormData`。
2. `formData.append(name, file)`。
3. 调用 `requestApi?.({ data: formData, onUploadProgress })`。
4. 进度事件转换为 `{ percent }` 后传给 Ant Design `onProgress`。
5. 成功调用 `onSuccess(res)`，失败调用 `onError(err)`。

## 事件流

普通选择：

```text
Upload onChange
  -> 遍历 v.fileList
  -> item.response = fileValide?.(item.originFileObj)
  -> item.status = item.error ? "error" : undefined
  -> setFileList(v.fileList)
  -> 外部 onChange(v)
```

拖拽目录：

```text
onDrop
  -> dropImageFileHandle(dataTransfer.items)
  -> 递归读取图片
  -> 按文件名排序
  -> 生成 UploadFile(uid/name/url/originFileObj/response/status)
  -> setFileList([...fileList, ...imageList])
  -> 对每个新增文件调用一次外部 onChange
```

删除：

```text
onRemove(file)
  -> 从内部 fileList 过滤 uid
  -> setFileList(newFileList)
  -> 外部 onRemove(file)
  -> 外部 onChange({ file, fileList: newFileList })
```

## 示例

```tsx
<DropFolderUpload
  name="image"
  fileValide={file => (file.size > 1024 * 1024 ? "文件不能超过 1MB" : "")}
  requestApi={({ data, onUploadProgress }) => uploadImage(data, onUploadProgress)}
  onChange={({ fileList }) => setImages(fileList)}
/>;
```

## 边界条件

- 普通选择文件时 `status` 判断使用 `item.error`，但校验错误写在 `item.response`；拖拽路径使用返回值设置 `status`，两条路径不一致。
- `{...props}` 最后展开，调用方传入同名事件会覆盖组件逻辑。
- 受控 `fileList` 与内部 `fileList` 并存，删除和拖拽追加仍基于内部状态计算。
- 文件夹拖拽依赖 File System Access API，兼容性有限。
- `URL.createObjectURL` 当前没有显式 revoke。
- `customRequest` 没有 `requestApi` 时仍会成功回调 `undefined`。
