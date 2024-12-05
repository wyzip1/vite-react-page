import React, { useState } from "react";
import { InboxOutlined } from "@ant-design/icons";
import { Image, Upload, UploadFile, UploadProps } from "antd";
import { customRequest, dropImageFileHandle, UploadRequestApi } from "./utils";
import { guid } from "@/utils";

const DropFolderUpload: React.FC<
  UploadProps & {
    fileValide?: (file: File) => string;
    requestApi?: UploadRequestApi;
  }
> = ({ onChange, onRemove, requestApi, name, fileValide, ...props }) => {
  const [fileList, setFileList] = useState<UploadFile<any>[]>([]);
  const [previewImage, setPreviewImage] = useState("");

  return (
    <>
      <Upload.Dragger
        fileList={props.fileList || fileList}
        listType="picture"
        accept="image/*"
        multiple
        beforeUpload={() => false}
        customRequest={options => customRequest({ ...options, name, requestApi })}
        onRemove={file => {
          const newFileList = fileList.filter(f => f.uid !== file.uid);
          setFileList(newFileList);
          onRemove?.(file);
          onChange?.({ file, fileList: newFileList });
        }}
        onChange={v => {
          v.fileList.forEach(item => {
            if (!item.originFileObj) return;
            item.response = fileValide?.(item.originFileObj);
            item.status = item.error ? "error" : undefined;
          });
          setFileList(v.fileList);
          onChange?.(v);
        }}
        onPreview={v => setPreviewImage(v.url || "")}
        onDrop={async e => {
          const images = await dropImageFileHandle(e.dataTransfer.items);
          images.sort((a, b) => a.name.localeCompare(b.name));
          const imageList: UploadFile<any>[] = images.map(v => {
            const error = fileValide?.(v);
            return {
              uid: guid(),
              name: v.name,
              url: URL.createObjectURL(v),
              originFileObj: v as any,
              response: error,
              status: error ? "error" : undefined,
            };
          });
          const newFileList = [...fileList, ...imageList];
          setFileList(newFileList);
          imageList.forEach(v => onChange?.({ file: v, fileList: newFileList }));
        }}
        {...props}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
      </Upload.Dragger>

      <Image
        preview={{
          visible: previewImage !== "",
          src: previewImage,
          onVisibleChange: v => !v && setPreviewImage(""),
          zIndex: 2000,
        }}
      />
    </>
  );
};

export default DropFolderUpload;
