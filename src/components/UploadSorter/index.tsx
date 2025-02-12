import { PlusOutlined } from "@ant-design/icons";
import { Image, Upload, UploadFile, UploadProps, theme } from "antd";
import { SortableContainer } from "react-sortable-hoc";
import { arrayMoveImmutable } from "array-move";
import SortableItem from "./SorterItem";

const SortableList = SortableContainer<{ children: React.ReactNode }>(({ children }) => (
  <div className="flex flex-wrap gap-2">{children}</div>
));

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
    <div style={{ width: 800 }} className="overflow-auto">
      <SortableList
        useDragHandle
        axis="xy"
        onSortEnd={({ oldIndex, newIndex }) => {
          const sortedList = arrayMoveImmutable(fileList, oldIndex, newIndex);
          setFileList(sortedList);
          onChange?.(sortedList);
        }}
      >
        {fileList.map((item, idx) => (
          <SortableItem
            key={item.uid}
            token={token}
            index={idx}
            item={item}
            disabled={disabledSorter || disabled || !multiple}
            itemDisabled={disabled}
            onPreview={item => {
              setPrewviewItem(item);
              setPreviewOpen(true);
            }}
            onDelete={() => setFileList(fileList.filter(i => i.uid !== item.uid))}
          />
        ))}
        <div>
          <Upload
            fileList={fileList}
            listType="picture-card"
            accept="image/*"
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
    </div>
  );
};

export default UploadSorter;
