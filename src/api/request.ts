import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

export interface RequestResponse<T> {
  code: number;
  message: string;
  data?: T;
}

export interface RequestArraybufferResponse {
  type: string;
  filename: string;
  value: ArrayBuffer;
}

if (process.env.NODE_ENV === "development") {
  // document.cookie = "kdt_id=119528100";
  document.cookie = "mobile=15697103925";
  document.cookie = "user_nickname=1V";
  document.cookie = "user_id=8987212890";
}

export const baseURL =
  process.env.NODE_ENV === "development" ? "/developmentApi" : window.location.origin;

const instance = axios.create({ baseURL });

instance.interceptors.request.use(config => {
  config.headers["Authorization"] = undefined;
  return config;
});

instance.interceptors.response.use(
  (res: AxiosResponse<RequestResponse<any> | ArrayBuffer>) => {
    if (res.data instanceof ArrayBuffer) {
      const result = handleArraybufferRequest(res as AxiosResponse<ArrayBuffer>);
      res.data = result;
    }
    if (![0, 200].includes(res.data.code)) {
      // message.error(res.data.resultMessage);
      return Promise.reject(res);
    }

    return res.data as any;
  },
  (err: AxiosError) => {
    if (err.code !== "ERR_CANCELED") {
      // message.error(err.message);
    }
    return Promise.reject(err);
  },
);

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

const request = <T>(config: AxiosRequestConfig): Promise<T> => {
  return instance(config);
};

export default request;
