import { PlusOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { Image, message, Upload } from "antd";
import type { RequestResponse } from "@/api/config";
import { uploadImage, type ImageInfo } from "./services";

const UploadImage: React.FC<
  UploadProps<RequestResponse<ImageInfo>> & { maxSize?: number; text?: string }
> = ({ text, ...props }) => {
  const [previewUrl, setPreviewUrl] = useState<any>(null);

  return (
    <>
      <Upload
        beforeUpload={file => {
          if (typeof props.maxSize === "number" && file.size > props.maxSize) {
            message.error("上传文件不能大于" + props.maxSize / 1024 / 1024 + "M");

            return false;
          }
        }}
        accept="image/*"
        listType="picture-card"
        onPreview={file => {
          setPreviewUrl(URL.createObjectURL(file.originFileObj!));
        }}
        customRequest={options => {
          const formData = new FormData();
          formData.append("file", options.file);
          uploadImage({
            data: formData,
            onProgress: e => options.onProgress?.({ percent: e.progress }),
          })
            .then(res => {
              options.onSuccess?.(res);
            })
            .catch(err => options.onError?.(err));
        }}
        {...props}
      >
        {(props.fileList?.length || 0) >= (props.maxCount || Infinity) ? null : (
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 4 }}>{text || "上传图片"}</div>
          </div>
        )}
      </Upload>
      <Image
        src=""
        preview={{
          visible: !!previewUrl,
          onVisibleChange: v => {
            if (v) return;
            setPreviewUrl(null);
            URL.revokeObjectURL(previewUrl);
          },
          src: previewUrl,
        }}
      />
    </>
  );
};

export default UploadImage;
