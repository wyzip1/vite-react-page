```ts
const upload = (data: FormData, config?: AxiosRequestConfig) => {
  request({
    url: "/upload",
    method: "POST",
    data,
    ...config,
  });
};

// 切片上传方法 示例
function selectFile(file: File) {
  uploadFile(file, {
    sliceSize: 1024 * 1024,
    onInit() {
      const formData = new FormData();
      formData.append("init", "true");
      return upload(formData);
    },
    onUpload(file, { index, bytes }, onProgress) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("idx", index.toString());
      formData.append("range", `${bytes[0]}-${bytes[1]}`);
      return upload(formData, { onUploadProgress: onProgress });
    },
    onEnd() {
      const formData = new FormData();
      formData.append("end", "true");
      return upload(formData);
    },
    onTotalProgress(percent, loaded) {
      console.log(percent, loaded);
    },
  });
}
```
