# UploadSorter

源码路径：

- `src/components/UploadSorter/index.tsx`
- `src/components/UploadSorter/SortableList.tsx`
- `src/components/UploadSorter/SortableItem.tsx`
- `src/components/UploadSorter/SortableOverlay.tsx`
- `src/components/UploadSorter/ImageItem.tsx`
- `src/components/UploadSorter/styled.ts`
- `src/components/UploadSorter/README.md`

`UploadSorter` 基于 Ant Design `Upload` 和 `@dnd-kit/sortable`，用于图片上传、预览、删除和拖拽排序。

## 类型

```ts
import type { UploadFile, UploadProps } from "antd";

type UploadSorterProps = Omit<UploadProps, "fileList" | "onChange"> & {
  disabledSorter?: boolean;
  value?: UploadFile<any>[];
  onChange?: (
    value: UploadFile<any>[],
    file?: UploadFile<any>,
    events?: { percent: number },
  ) => void;
};
```

## Props

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `value` | `UploadFile<any>[]` | 否 | `[]` | 外部文件列表；变化时同步到内部 `fileList`。 |
| `onChange` | `(value, file?, events?) => void` | 否 | `undefined` | 上传、删除、排序后触发。 |
| `disabledSorter` | `boolean` | 否 | `undefined` | 禁用拖拽排序。 |
| `disabled` | `boolean` | 否 | `undefined` | 透传给 Upload，并禁用删除和排序。 |
| `multiple` | `boolean` | 否 | `undefined` | 透传给 Upload；只有为真时允许排序。 |
| 其他 UploadProps | `Omit<UploadProps, "fileList" \| "onChange">` | 否 | Ant Design 默认值 | 最后展开到内部 Upload，可能覆盖预设。 |

内部 Upload 预设：

| 字段 | 值 |
| --- | --- |
| `accept` | `"image/*"` |
| `listType` | `"picture-card"` |
| `fileList` | 内部 `fileList` |
| `showUploadList` | `false` |

## 内部状态

| 状态 | 类型 | 初始值 | 说明 |
| --- | --- | --- | --- |
| `fileList` | `UploadFile<any>[]` | `[]` | 展示、上传、删除和排序的内部列表。 |
| `previewItem` | `UploadFile<any> \| undefined` | `undefined` | 当前预览文件。 |
| `previewOpen` | `boolean` | `false` | Ant Design `Image` 预览开关。 |

## 子模块职责

| 文件 | 职责 |
| --- | --- |
| `SortableList.tsx` | 创建 DnD context、Pointer/Keyboard sensor、排序策略和 `arrayMove`。 |
| `SortableItem.tsx` | 调用 `useSortable`，把 transform/transition 写入样式，禁用时不渲染拖拽激活层。 |
| `SortableOverlay.tsx` | 渲染拖拽浮层和 dropAnimation。 |
| `ImageItem.tsx` | 渲染缩略图、上传进度、错误 Tooltip、预览和删除按钮。 |
| `styled.ts` | 定义 102px 图片卡片、hover 操作层、错误边框和进度条样式。 |

## 事件流

受控同步：

```text
value 变化
  -> useEffect
  -> setFileList(value || [])
```

上传：

```text
Upload.onChange(info)
  -> setFileList(info.fileList)
  -> onChange?.(info.fileList, info.file, info.event)
```

排序：

```text
SortableList.onDragEnd
  -> active.id 与 over.id 不同
  -> 计算 activeIndex / overIndex
  -> arrayMove(items, activeIndex, overIndex)
  -> UploadSorter setFileList(items)
  -> onChange?.(items)
```

删除：

```text
ImageItem.onDelete
  -> 过滤当前 uid
  -> setFileList(list)
  -> onChange?.(list)
```

预览：

```text
ImageItem.onPreview
  -> setPreviewItem(item)
  -> setPreviewOpen(true)
  -> Image.preview 打开
  -> afterOpenChange(false) 清空 previewItem
```

## 上传状态展示

| 条件 | 展示 |
| --- | --- |
| `item.status === "uploading"` | “文件上传中”和进度条，进度为 `item.percent || 0`。 |
| `item.error !== undefined || item.status === "error"` | 错误边框；Tooltip 文案优先 `item.response?.message`，否则“上传错误”。 |
| 正常图片 | 缩略图，hover 时显示预览和删除按钮。 |

## 示例

```tsx
const [images, setImages] = useState<UploadFile<any>[]>([]);

<UploadSorter
  multiple
  value={images}
  action="/api/upload"
  name="file"
  maxCount={6}
  onChange={list => setImages(list)}
/>;
```

## 边界条件

- 排序依赖 `UploadFile.uid`，必须稳定且唯一。
- `disabledSorter || disabled || !multiple` 为真时禁用排序。
- 上传按钮显示条件当前是 `!disabled && (uploadProps.maxCount || -Infinity) < fileList.length`，与常见 `maxCount` 语义可能相反。
- `{...uploadProps}` 最后展开，传入 `onChange/fileList/showUploadList` 会覆盖组件预设。
- 对象 URL 当前没有显式 revoke。
- 没有 url、thumbUrl、originFileObj 的项无法预览。
