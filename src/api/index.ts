import type { List, Pagination } from "@/hooks/useFetchList";
import type { RequestResponse } from "./config";
import { request } from "./config";
import type { CancelTokenSource } from "axios";

export interface MockListItem {
  id: number;
  name: string;
  sex: number;
  desc: string;
  data: {
    money: number;
  };
  test?: any;
  date?: string;
  dateRange?: [string, string];
}

export interface MockListParams extends Pagination {
  name?: string;
}

export const fetchMockList = ({
  cancelToken,
  body,
}: {
  cancelToken?: CancelTokenSource["token"];
  body?: MockListParams;
}) => {
  return request({
    url: "/api/list",
    method: "POST",
    cancelToken: cancelToken,
    data: body,
  }) as Promise<RequestResponse<List<MockListItem>>>;
};
