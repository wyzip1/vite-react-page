import { RequestResponse } from "@/api/utils/request";
import { UploadProps } from "antd";
import { AxiosRequestConfig } from "axios";

export async function dropImageFileHandle(dataList: any) {
  const result: File[] = [];
  const handleList: Promise<any>[] = [];

  for (let i = 0; i < dataList.length; i++) {
    if (dataList[i].kind !== "file") continue;
    handleList.push(
      (dataList[i].getAsFileSystemHandle() as Promise<any>)
        .then(treaverDir)
        .then(images => result.push(...images)),
    );
  }
  await Promise.all(handleList);
  return result;
}

export async function treaverDir(dirHandle: any) {
  const imageList: File[] = [];

  if (dirHandle.kind === "file") {
    const file = await dirHandle.getFile();
    if (file.type.startsWith("image/")) imageList.push(file);
    return imageList;
  }

  for await (const [, value] of dirHandle.entries()) {
    if (value.kind === "file") {
      const file = await value.getFile();
      if (!file.type.startsWith("image/")) continue;
      imageList.push(file);
    } else if (value.kind === "directory") imageList.push(...(await treaverDir(value)));
  }

  return imageList;
}

export type UploadRequestApi = (params: {
  data: FormData;
  onUploadProgress?: AxiosRequestConfig["onUploadProgress"];
}) => Promise<RequestResponse<any>>;

type CustomRequestProps = Parameters<NonNullable<UploadProps["customRequest"]>>[0] & {
  requestApi?: UploadRequestApi;
  name?: string;
};

export const customRequest = async ({
  file,
  name = "file",
  onSuccess,
  onProgress,
  onError,
  requestApi,
}: CustomRequestProps) => {
  try {
    const formData = new FormData();
    formData.append(name, file);
    const res = await requestApi?.({
      data: formData,
      onUploadProgress(progressEvent) {
        if (!progressEvent) return;
        onProgress?.({
          percent: (progressEvent.loaded / progressEvent.total!) * 100,
        });
      },
    });
    onSuccess?.(res);
  } catch (err) {
    onError?.(err as any);
  }
};
