import { MockListItem, MockListParams } from "./mock-model";
import List from "./model/List";
import { createRequest } from "./request";

export const fetchMockList = createRequest<List<MockListItem>, MockListParams>(params => ({
  url: "/api/list",
  method: "POST",
  params,
}));
