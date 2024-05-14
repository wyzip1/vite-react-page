import Pagination from "../model/Pagination";

export interface MockListItem {
  id: number;
  name: string;
  sex: number;
  desc: string;
  data: {
    money: number;
  };
}

export interface MockListParams extends Pagination {
  name?: string;
  [key: string]: any;
}
