# 上传组件

本页覆盖 `DropFolderUpload` 和 `UploadSorter`。两个组件都基于 Ant Design `Upload`，但职责不同：`DropFolderUpload` 侧重拖拽文件夹和校验，`UploadSorter` 侧重图片列表排序、预览和删除。

## DropFolderUpload

`DropFolderUpload` 位于 `src/components/DropFolderUpload`。

| 文件 | 职责 |
| --- | --- |
| `src/components/DropFolderUpload/index.tsx` | 主组件、文件列表、预览、Upload.Dragger 事件。 |
| `src/components/DropFolderUpload/utils.ts` | 文件夹递归读取、图片过滤、自定义上传请求。 |

### 职责

基于 `Upload.Dragger` 渲染图片拖拽上传区域，支持从文件夹递归读取图片、前端校验、图片预览，以及通过 `requestApi` 接管上传请求。

### Props

组件类型为 `UploadProps & { fileValide?: (file: File) => string; requestApi?: UploadRequestApi }`。Ant Design `UploadProps` 会透传给 `Upload.Dragger`，但部分字段被组件先设置后又被 `props` 后展开覆盖。

| 字段 | 类型 | 必填 | 默认值 | 透传关系与说明 |
| --- | --- | --- | --- | --- |
| `fileValide` | `(file: File) => string` | 否 | `undefined` | 文件校验函数。返回非空文案时写入 `UploadFile.response`。 |
| `requestApi` | `(params: { data: FormData; onUploadProgress?: AxiosRequestConfig["onUploadProgress"] }) => Promise<RequestResponse<any>>` | 否 | `undefined` | 传给 `customRequest`。未传时 `customRequest` 仍会调用 `onSuccess(undefined)`。 |
| `name` | `string` | 否 | `customRequest` 内为 `"file"` | 上传字段名。作为 `FormData.append(name, file)` 的 key。 |
| `fileList` | `UploadProps["fileList"]` | 否 | 内部 `fileList` | 传入后展示使用受控列表；内部仍会维护自己的 `fileList`。 |
| `onChange` | `UploadProps["onChange"]` | 否 | `undefined` | 普通选择、删除、拖拽文件夹添加时触发。 |
| `onRemove` | `UploadProps["onRemove"]` | 否 | `undefined` | 删除文件时先更新内部列表，再调用。 |
| 其他 `UploadProps` | Ant Design 类型 | 否 | Ant Design 默认值 | 最终 `{...props}` 后展开，可覆盖组件预设的 `accept/multiple/beforeUpload/customRequest/onChange/onDrop/onPreview` 等。 |

组件预设值：

| 字段 | 预设值 | 说明 |
| --- | --- | --- |
| `listType` | `"picture"` | 图片列表样式。 |
| `accept` | `"image/*"` | 默认只接受图片。 |
| `multiple` | `true` | 默认多选。 |
| `beforeUpload` | `() => false` | 阻止 Ant Design 自动上传。 |
| `customRequest` | `options => customRequest({ ...options, name, requestApi })` | 用 `requestApi` 包装上传请求。 |

### 内部状态与事件流

| 状态 | 类型 | 初始值 | 说明 |
| --- | --- | --- | --- |
| `fileList` | `UploadFile<any>[]` | `[]` | 非受控时的展示列表，也是删除和拖拽追加时计算新列表的来源。 |
| `previewImage` | `string` | `""` | 非空时打开 Ant Design `Image` 预览。 |

普通选择文件流程：

1. `beforeUpload` 返回 `false`，文件进入 `v.fileList`，不自动上传。
2. `onChange` 遍历 `v.fileList`。
3. 对存在 `originFileObj` 的项执行 `fileValide(originFileObj)`，结果写入 `item.response`。
4. 如果 `item.error` 存在则 `status` 置为 `"error"`，否则置为 `undefined`。
5. 更新内部 `fileList`，并调用外部 `onChange(v)`。

删除流程：

1. `onRemove(file)` 根据内部 `fileList` 过滤 `uid`。
2. 更新内部 `fileList`。
3. 调用外部 `onRemove(file)`。
4. 调用外部 `onChange({ file, fileList: newFileList })`。

拖拽文件夹流程：

1. `onDrop` 读取 `e.dataTransfer.items`。
2. `dropImageFileHandle` 对每个 file item 调用 `getAsFileSystemHandle()`。
3. `treaverDir` 递归读取目录，只保留 `file.type.startsWith("image/")` 的文件。
4. 图片按 `name.localeCompare` 排序。
5. 每个图片生成 `UploadFile`：`uid` 来自 `guid()`，`url` 来自 `URL.createObjectURL(file)`，`originFileObj` 保留原文件。
6. 对每个新文件调用一次外部 `onChange({ file, fileList: newFileList })`。

预览流程：点击列表项预览时把 `v.url || ""` 写入 `previewImage`；`Image.preview.visible` 根据非空判断，关闭时重置为空字符串。

### 依赖

- Ant Design：`Upload.Dragger`、`Image`。
- Ant Design Icons：`InboxOutlined`。
- 本地工具：`guid`。
- 本地类型：`RequestResponse`。
- Axios 类型：`AxiosRequestConfig["onUploadProgress"]`。
- 浏览器 File System Access API：`getAsFileSystemHandle`、目录 `entries()`。

### 使用示例

```tsx
<DropFolderUpload
  name="image"
  fileValide={file => (file.size > 1024 * 1024 ? "文件不能超过 1MB" : "")}
  requestApi={({ data, onUploadProgress }) => uploadImage(data, onUploadProgress)}
  onChange={({ fileList }) => setImages(fileList)}
/>;
```

### 注意事项与边界条件

- `fileValide` 名称按当前实现保留，返回非空字符串代表错误文案；普通选择文件时状态判断使用 `item.error`，拖拽文件夹时使用返回值设置 `status`，两条路径不完全一致。
- `props` 最后展开，调用方传入同名 `onChange/onDrop/customRequest/beforeUpload` 会覆盖组件内置逻辑。
- 受控传入 `fileList` 时，展示列表来自 `props.fileList`，但删除和拖拽追加仍基于内部 `fileList` 计算，调用方需要用 `onChange` 同步状态。
- 文件夹拖拽依赖 `getAsFileSystemHandle`，浏览器不支持该 API 时无法按当前逻辑递归读取目录。
- 递归读取只保留 MIME 类型以 `image/` 开头的文件。
- `URL.createObjectURL` 创建的预览地址当前没有显式 revoke。
- `onPreview` 只取 `UploadFile.url`，没有使用 `thumbUrl` 或 `originFileObj` 兜底。
- `customRequest` 在没有 `requestApi` 时会直接成功回调 `undefined`。

## UploadSorter

`UploadSorter` 位于 `src/components/UploadSorter`。

| 文件 | 职责 |
| --- | --- |
| `src/components/UploadSorter/index.tsx` | 主组件、受控值同步、上传、预览、删除、排序回调。 |
| `src/components/UploadSorter/SortableList.tsx` | `@dnd-kit` 拖拽上下文、传感器、排序计算。 |
| `src/components/UploadSorter/SortableItem.tsx` | 单项 sortable 容器和拖拽激活层。 |
| `src/components/UploadSorter/ImageItem.tsx` | 图片缩略图、上传中进度、错误提示、预览/删除按钮。 |
| `src/components/UploadSorter/SortableOverlay.tsx` | 拖拽浮层和放置动画。 |
| `src/components/UploadSorter/styled.ts` | 102px 图片卡片、错误边框、上传进度条、hover 操作。 |
| `src/components/UploadSorter/README.md` | 源码目录内的简单使用示例。 |

### 职责

基于 Ant Design `Upload` 和 `@dnd-kit/sortable` 实现图片上传列表，支持预览、删除、上传状态展示和拖拽排序。组件更适合作为受控组件使用，`value` 是实际图片列表来源。

### Props

组件类型为 `Omit<UploadProps, "fileList" | "onChange"> & { disabledSorter?: boolean; value?: UploadFile<any>[]; onChange?: (...) => void }`。

| 字段 | 类型 | 必填 | 默认值 | 透传关系与说明 |
| --- | --- | --- | --- | --- |
| `value` | `UploadFile<any>[]` | 否 | `[]` | 外部文件列表。变化后通过 `useEffect` 同步到内部 `fileList`。 |
| `onChange` | `(value: UploadFile<any>[], file?: UploadFile<any>, events?: { percent: number }) => void` | 否 | `undefined` | 上传变化、删除、排序后触发。上传变化会额外带 `info.file` 和 `info.event`。 |
| `disabledSorter` | `boolean` | 否 | `undefined` | 禁用排序拖拽层。 |
| `disabled` | `boolean` | 否 | `undefined` | 透传给 `Upload`，同时禁用删除和排序。 |
| `multiple` | `boolean` | 否 | `undefined` | 透传给 `Upload`；排序只有在 `multiple` 为真时启用。 |
| 其他 `UploadProps` | Ant Design 类型 | 否 | Ant Design 默认值 | 透传给内部 `Upload`。组件固定传入 `accept/listType/fileList/showUploadList/onChange/disabled/multiple`，之后 `{...uploadProps}` 可覆盖这些预设。 |

内部 `Upload` 预设值：

| 字段 | 预设值 | 说明 |
| --- | --- | --- |
| `accept` | `"image/*"` | 默认图片上传。 |
| `listType` | `"picture-card"` | 触发上传按钮的卡片样式。 |
| `fileList` | 内部 `fileList` | 与排序列表保持一致。 |
| `showUploadList` | `false` | 列表由 `ImageItem` 自定义渲染。 |

### 内部状态与事件流

| 状态 | 类型 | 初始值 | 说明 |
| --- | --- | --- | --- |
| `fileList` | `UploadFile<any>[]` | `[]` | 展示、上传、删除和排序的内部列表。 |
| `previewItem` | `UploadFile<any> \| undefined` | `undefined` | 当前预览文件。 |
| `previewOpen` | `boolean` | `false` | Ant Design `Image` 预览开关。 |

受控同步流程：`value` 变化时执行 `setFileList(value || [])`。

上传流程：

1. 内部 `Upload.onChange(info)` 被触发。
2. `fileList` 更新为 `info.fileList`。
3. 调用 `onChange(info.fileList, info.file, info.event)`。

排序流程：

1. `SortableList` 把每个文件映射为 `{ id: uid, ...file }`。
2. 拖拽开始时记录 `active`。
3. 拖拽结束时，如果 `over` 存在且 id 变化，计算 `activeIndex/overIndex`。
4. 使用 `arrayMove(items, activeIndex, overIndex)` 得到新列表。
5. `UploadSorter` 更新内部 `fileList` 并调用 `onChange(items)`。

删除流程：`ImageItem` 点击删除后过滤当前 `uid`，更新内部列表，并调用 `onChange(list)`。

预览流程：`ImageItem` 生成 `previewUrl = item.url || item.thumbUrl || createFileURL(item.originFileObj)`；点击预览后把带 `url` 的 item 写入 `previewItem`，打开隐藏 `Image` 的预览。关闭后 `afterOpenChange(false)` 清空 `previewItem`。

上传中和错误展示：

- `item.status === "uploading"` 时显示“文件上传中”和内部进度条，进度来自 `item.percent || 0`。
- `item.error !== undefined || item.status === "error"` 时使用错误边框；Tooltip 文案优先 `item.response?.message`，否则为“上传错误”。

### 依赖

- Ant Design：`Upload`、`Image`、`Tooltip`、`theme.useToken`。
- Ant Design Icons：`PlusOutlined`、`DeleteOutlined`、`EyeOutlined`。
- `@dnd-kit/core`：`DndContext`、`DragOverlay`、`PointerSensor`、`KeyboardSensor`。
- `@dnd-kit/sortable`：`SortableContext`、`useSortable`、`arrayMove`、`sortableKeyboardCoordinates`。
- `@dnd-kit/utilities`：`CSS.Translate.toString`。
- `styled-components`：图片项样式。

### 使用示例

```tsx
const [images, setImages] = useState<UploadFile<any>[]>([]);

<UploadSorter
  multiple
  value={images}
  action="/api/upload"
  name="file"
  maxCount={6}
  onChange={list =>
    setImages(
      list.map(item => ({
        ...item,
        url: item.status === "done" ? item.response?.url : item.url,
      })),
    )
  }
/>;
```

### 注意事项与边界条件

- 排序依赖 `UploadFile.uid`，列表项必须有稳定且唯一的 `uid`。
- `disabledSorter || disabled || !multiple` 为真时不渲染拖拽激活层。
- 组件内部仍维护 `fileList`，但实际推荐由外部维护 `value`，否则父组件无法持久化排序、删除和上传结果。
- 上传按钮显示条件是 `!disabled && (uploadProps.maxCount || -Infinity) < fileList.length`。按当前实现，未传 `maxCount` 时不会显示上传按钮；`maxCount` 小于当前数量时才显示，可能需要主线程确认是否符合预期。
- `uploadProps` 最后展开，调用方传入 `fileList/showUploadList/onChange/accept/listType` 会覆盖组件预设并影响自定义列表行为。
- `createFileURL` 创建的对象 URL 当前没有显式 revoke。
- `Image` 预览只使用 `previewItem.url`；没有 url、thumbUrl、originFileObj 的项无法预览。
- 拖拽浮层会复用 `renderItem(activeItem)`，因此预览/删除按钮结构和普通项一致。
