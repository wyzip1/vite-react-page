import { AxiosRequestConfig, CancelToken } from "axios";
import request, { RequestArraybufferResponse } from "./request";
import { message } from "antd";
import { formatMutipleNum } from "@/utils";

export const createRequest = <T, R>(requestCallback: (params: T) => AxiosRequestConfig) => {
  return (params: T, cancelToken?: CancelToken) =>
    request<R>({ cancelToken, ...requestCallback(params) });
};

export const downloadFile = async (config: AxiosRequestConfig): Promise<void> => {
  const res = await request<RequestArraybufferResponse>({
    responseType: "arraybuffer",
    ...config,
  });

  const blob = new Blob([res.value], { type: res.type });
  const url = URL.createObjectURL(blob);
  // window.open(url); ??
  const link = document.createElement("a");
  link.download = decodeURIComponent(res.filename);
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
  message.success("导出成功");
};

export interface UploadOptions {
  sliceSize: number;
  onInit?: () => any | Promise<any>;
  onUpload: (
    slice: Blob,
    info: { index: number; bytes: [number, number] },
    onProgress?: (progressEvent: ProgressEvent) => any
  ) => any | Promise<any>;
  onTotalProgress?: (percent: number, loaded: number) => any;
  onEnd?: () => any | Promise<any>;
}

const uploadQueue: Promise<any>[] = [];
const uploadedDataQueue: number[] = [];

export const uploadFile = async (file: File, options: UploadOptions) => {
  await options?.onInit?.();

  const sliceCount = Math.ceil(file.size / options.sliceSize);
  for (let i = 0; i < sliceCount; i++) {
    const bytes: [number, number] = [i * options.sliceSize, (i + 1) * options.sliceSize];

    const sliceFile = file.slice(bytes[0], bytes[1]);
    const info = { index: i, bytes };
    uploadQueue.push(
      options.onUpload(sliceFile, info, event => {
        uploadedDataQueue[i] = event.loaded;
        const totalLoaded = uploadedDataQueue.reduce((a, b) => a + (b || 0), 0) / file.size;
        const percent = formatMutipleNum(totalLoaded, 0.01) as number;

        options.onTotalProgress?.(percent, totalLoaded);
      })
    );
  }

  const batchRes = await Promise.all(uploadQueue);

  return options?.onEnd?.() || batchRes;
};
