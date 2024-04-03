import Pagination from "../model/Pagination";

export interface MockListItem {
  [key: string]: any;
}

export interface MockListParams extends Pagination {
  name?: string;
  [key: string]: any;
}
