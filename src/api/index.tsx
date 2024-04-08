import { MockListItem, MockListParams } from "./mock-model";
import List from "./model/List";
import { createRequest } from "./req-utils";

export const fetchMockList = createRequest<MockListParams, List<MockListItem>>(params => ({
  url: "/api/list",
  method: "POST",
  params,
}));
