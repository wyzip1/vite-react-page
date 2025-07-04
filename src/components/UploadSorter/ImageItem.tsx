import { GlobalToken, Tooltip, UploadFile } from "antd";
import { SortItemStyled } from "./styled";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";

interface ImageProps {
  item: UploadFile<any>;
  token: GlobalToken;
  onPreview?: (item: UploadFile<any>) => void;
  onDelete?: (item: UploadFile<any>) => void;
  itemDisabled?: boolean;
}

function createFileURL(file?: File) {
  if (!file) return;
  const url = URL.createObjectURL(new Blob([file], { type: file.type }));
  return url;
}

const ImageItem: React.FC<ImageProps> = ({
  item,
  token,
  onPreview,
  onDelete,
  itemDisabled,
}) => {
  const previewUrl = item.url || item.thumbUrl || createFileURL(item.originFileObj as File);
  const isError = item.error !== undefined || item.status === "error";

  return (
    <SortItemStyled token={token} error={isError}>
      {item.status === "uploading" ? (
        <div
          className="content uploading"
          style={{ borderStyle: "dashed", backgroundColor: token.colorFillAlter }}
        >
          <div>文件上传中</div>
          <div
            className="percent"
            style={{ "--percent": `${item.percent || 0}%` } as React.CSSProperties}
          ></div>
        </div>
      ) : (
        <Tooltip title={isError ? item.response?.message || "上传错误" : ""}>
          <div className="content">
            <img
              className="w-full h-full object-contain upload-img drag-none"
              src={previewUrl}
            />
            <div className="flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 z-20 actions">
              <div
                className="w-6 text-center text-white cursor-pointer"
                onClick={() => {
                  onPreview?.({ ...item, url: previewUrl });
                }}
              >
                <EyeOutlined />
              </div>
              {!itemDisabled && (
                <div
                  className="w-6 text-center text-white cursor-pointer"
                  onClick={() => onDelete?.(item)}
                >
                  <DeleteOutlined />
                </div>
              )}
            </div>
          </div>
        </Tooltip>
      )}
    </SortItemStyled>
  );
};

export default ImageItem;
