import axios, { InternalAxiosRequestConfig } from "axios";
import { message } from "antd";
import { downloadBlob } from "@/utils/index";

import type { AxiosRequestConfig, AxiosError, CancelToken } from "axios";

export interface Response<T> {
  resultStatus: number;
  resultCode: string;
  resultMessage: string;
  data: T;
}

if (process.env.NODE_ENV === "development") {
  document.cookie = "kdt_id=119528100";
  // document.cookie = "kdt_id=119804900";
  document.cookie = "mobile=15697103925";
  document.cookie = "user_nickname=1V";
  document.cookie = "user_id=8987212890";
}

const baseURL =
  process.env.NODE_ENV === "development" ? "/developmentApi" : window.location.origin;

const instance = axios.create({ baseURL });

function unifiedParams(config: InternalAxiosRequestConfig) {
  if (config.method?.toLocaleUpperCase() === "GET") config.params = config.data;
  return config;
}

instance.interceptors.request.use(unifiedParams);

instance.interceptors.response.use(
  res => {
    if (![0, 200].includes(res.data.resultStatus)) {
      message.error(res.data.resultMessage);
      return Promise.reject(res);
    }
    return res.data;
  },
  (res: AxiosError) => {
    message.error(res.message);
  }
);

export default function request<T>(config: AxiosRequestConfig): Promise<Response<T>> {
  return instance(config);
}

export interface DownLoadData {
  content: BlobPart;
  contentType: string;
  filename: string;
}

const download = axios.create({ baseURL, responseType: "arraybuffer" });
download.interceptors.request.use(unifiedParams);
download.interceptors.response.use(
  res => {
    const contentType = res.headers["content-type"];
    const propList = res.headers["content-disposition"]?.split(";");
    const filename = propList?.find(i => i.includes("filename"))?.split("=")[1];

    res.data = { contentType, filename, content: res.data } as DownLoadData;
    return res.data;
  },
  (res: AxiosError) => {
    message.error(res.message);
  }
);

function requestFile(config: AxiosRequestConfig): Promise<DownLoadData> {
  return download(config);
}

export async function downloadFile(config: AxiosRequestConfig): Promise<void> {
  const data = await requestFile(config);
  message.success("导出成功");
  return downloadBlob(data.content, data.contentType, data.filename);
}

export const createRequest = <T, R>(requestCallback: (params: T) => AxiosRequestConfig) => {
  return (params: T, cancelToken?: CancelToken) =>
    request<R>({ cancelToken, ...requestCallback(params) });
};
