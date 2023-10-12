import Pagination from "../model/Pagination";

export interface MockListItem {}

export interface MockListParams extends Pagination {
  name?: string;
}
