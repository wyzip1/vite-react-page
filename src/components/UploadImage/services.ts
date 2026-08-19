import { request } from "@/api/config";
import type { AxiosRequestConfig } from "axios";

export interface ImageInfo {
  height: number;
  image_id: number;
  image_url: string;
  kdt_id: number;
  width: number;
}

interface IUploadImageParams {
  data: FormData;
  onProgress: AxiosRequestConfig["onUploadProgress"];
}

export const uploadImage = ({ data, onProgress }: IUploadImageParams) => {
  return request<ImageInfo>({
    url: "/v1/open/youzan/uploadMaterial",
    method: "POST",
    data,
    onUploadProgress: onProgress,
  });
};
