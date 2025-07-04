import { Image, theme, Upload, UploadFile, UploadProps } from "antd";
import { SortableList } from "./SortableList";
import { PlusOutlined } from "@ant-design/icons";
import SortableItem from "./SortableItem";
import ImageItem from "./ImageItem";

const UploadSorter: React.FC<
  Omit<UploadProps, "fileList" | "onChange"> & {
    disabledSorter?: boolean;
    value?: UploadFile<any>[];
    onChange?: (
      value: UploadFile<any>[],
      file?: UploadFile<any>,
      events?: { percent: number },
    ) => void;
  }
> = ({ value, onChange, disabledSorter, disabled, multiple, ...uploadProps }) => {
  const [fileList, setFileList] = useState<UploadFile<any>[]>([]);

  const { token } = theme.useToken();

  const [previewItem, setPrewviewItem] = useState<UploadFile<any>>();
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    setFileList(value || []);
  }, [value]);

  return (
    <>
      <SortableList
        items={fileList.map(v => ({ id: v.uid, ...v }))}
        onChange={items => {
          setFileList(items);
          onChange?.(items);
        }}
        renderItem={item => (
          <SortableItem id={item.id} disabled={disabledSorter || disabled || !multiple}>
            <ImageItem
              token={token}
              item={item}
              itemDisabled={disabled}
              onPreview={item => {
                setPrewviewItem(item);
                setPreviewOpen(true);
              }}
              onDelete={() => {
                const list = fileList.filter(i => i.uid !== item.uid);
                setFileList(list);
                onChange?.(list);
              }}
            />
          </SortableItem>
        )}
      >
        <div>
          <Upload
            accept="image/*"
            listType="picture-card"
            fileList={fileList}
            showUploadList={false}
            onChange={info => {
              setFileList(info.fileList);
              onChange?.(info.fileList, info.file, info.event);
            }}
            disabled={disabled}
            multiple={multiple}
            {...uploadProps}
          >
            {!disabled && (uploadProps.maxCount || -Infinity) < fileList.length && (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传图片</div>
              </div>
            )}
          </Upload>
        </div>
      </SortableList>

      {previewItem && (
        <Image
          wrapperStyle={{ display: "none" }}
          preview={{
            visible: previewOpen,
            onVisibleChange: visible => setPreviewOpen(visible),
            afterOpenChange: visible => !visible && setPrewviewItem(undefined),
          }}
          src={previewItem.url}
        />
      )}
    </>
  );
};

export default UploadSorter;
