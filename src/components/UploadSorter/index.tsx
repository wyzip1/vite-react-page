import type { UploadFile, UploadProps } from "antd";
import { Image, theme } from "antd";
import { SortableList } from "./SortableList";
import { PlusOutlined } from "@ant-design/icons";
import SortableItem from "./SortableItem";
import ImageItem from "./ImageItem";
import UploadImage from "../UploadImage";
import type { RequestResponse } from "@/api/config";
import type { ImageInfo } from "../UploadImage/services";

const UploadSorter: React.FC<
  Omit<UploadProps, "fileList" | "onChange"> & {
    disabledSorter?: boolean;
    value?: UploadFile<any>[];
    onChange?: (
      value: UploadFile<any>[],
      file?: UploadFile<any>,
      events?: { percent: number },
    ) => void;
    maxSize?: number;
  }
> = ({ value, onChange, disabledSorter, disabled, multiple, ...uploadProps }) => {
  const [internalFileList, setInternalFileList] = useState<
    UploadFile<RequestResponse<ImageInfo>>[]
  >([]);
  const fileList = value ?? internalFileList;

  function updateFileList(
    nextFileList: UploadFile<any>[],
    file?: UploadFile<any>,
    events?: { percent: number },
  ) {
    if (value === undefined) setInternalFileList(nextFileList);
    onChange?.(nextFileList, file, events);
  }

  const { token } = theme.useToken();

  const previewList = useMemo(() => {
    return fileList.map(i => ({
      src: i.response?.data.image_url || i.url || "",
    }));
  }, [fileList]);

  const [previewIdx, setPreviewIdx] = useState<number>();
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <SortableList
        items={fileList.map(v => ({ id: v.uid, ...v }))}
        onChange={items => {
          updateFileList(items);
        }}
        renderItem={(item, idx) => (
          <SortableItem id={item.id} disabled={disabledSorter || disabled || !multiple}>
            <ImageItem
              token={token}
              item={item}
              itemDisabled={disabled}
              onPreview={() => {
                setPreviewIdx(idx);
                setPreviewOpen(true);
              }}
              onDelete={() => {
                const list = fileList.filter(i => i.uid !== item.uid);
                updateFileList(list);
              }}
            />
          </SortableItem>
        )}
      >
        <div>
          <UploadImage
            fileList={fileList}
            showUploadList={false}
            onChange={info => {
              updateFileList(info.fileList, info.file, info.event);
            }}
            disabled={disabled}
            multiple={multiple}
            onPreview={file => {
              setPreviewIdx(fileList.indexOf(file));
              setPreviewOpen(true);
            }}
            {...uploadProps}
          >
            {!disabled && (uploadProps.maxCount || -Infinity) < fileList.length && (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传图片</div>
              </div>
            )}
          </UploadImage>
        </div>
      </SortableList>

      <Image.PreviewGroup
        items={previewList}
        preview={{
          current: previewIdx,
          open: previewOpen,
          onChange(current) {
            setPreviewIdx(current);
          },
          onOpenChange: open => setPreviewOpen(open),
          afterOpenChange: open => !open && setPreviewIdx(undefined),
        }}
      />
    </>
  );
};

export default UploadSorter;
