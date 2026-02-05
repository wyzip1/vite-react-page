import type { CreateClientConfig } from "./generated/client.gen";
import type { AxiosError, AxiosResponse } from "axios";
import axios from "axios";
import { filterObjEmpty } from "@/utils";
import { message } from "antd";

export interface RequestResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface RequestArraybufferResponse {
  type: string;
  filename: string;
  value: ArrayBuffer;
}

export const baseURL =
  process.env.NODE_ENV === "development" ? "/developmentApi" : window.location.origin;

// 创建配置好的 axios instance，包含拦截器
const axiosInstance = axios.create({ baseURL });

// 请求拦截器：数据处理
axiosInstance.interceptors.request.use(config => {
  // 跳过FormData、URLSearchParams和字符串的处理（字符串可能是已序列化的body，如urlSearchParamsBodySerializer的结果）
  // 只对普通对象进行过滤处理
  if (
    !(config.data instanceof FormData) &&
    !(config.data instanceof URLSearchParams) &&
    !Array.isArray(config.data) &&
    config.data !== null &&
    typeof config.data === "object"
  ) {
    // 只处理对象类型的数据
    config.data = filterObjEmpty(config.data);
  }
  config.params = filterObjEmpty(config.params);

  return config;
});

// 响应拦截器：处理错误
axiosInstance.interceptors.response.use(
  res => {
    if (res.data instanceof ArrayBuffer) {
      const result = handleArraybufferRequest(res as AxiosResponse<ArrayBuffer>);
      res.data = result;
    }

    if (![0, 200].includes(res.data.code)) {
      message.error(res.data.message);
      return Promise.reject(res);
    }

    return res.data as any;
  },
  (err: AxiosError) => {
    if (err.code !== "ERR_CANCELED") {
      message.error((err.response?.data as RequestResponse<any>)?.message || err.message);
    }
    return Promise.reject(err);
  },
);

export const createClientConfig: CreateClientConfig = config => ({
  ...config,
  // 使用配置好的 axios instance（包含拦截器）
  axios: axiosInstance,
  async responseValidator(data) {
    console.log("1231", data);
    return data;
  },
  throwOnError: true,
  baseURL,
});

function handleArraybufferRequest(
  res: AxiosResponse<ArrayBuffer>,
): RequestResponse<RequestArraybufferResponse> {
  const contentType: string = res.headers["content-type"];

  if (contentType.includes("application/json")) {
    const text = new TextDecoder("utf-8");
    const info = text.decode(res.data);
    return JSON.parse(info);
  } else {
    const contentDisposition: string | undefined = res.headers["content-disposition"];
    const filename = contentDisposition?.split(";")[1].split("=")[1];
    const result = {
      type: contentType,
      filename: filename || Date.now().toString(),
      value: res.data,
    };
    return {
      code: 200,
      message: "ok",
      data: result,
    };
  }
}
