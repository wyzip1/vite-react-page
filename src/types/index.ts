import { SorterResult } from "antd/es/table/interface";
import { RouteObject } from "react-router-dom";

export type SortType<T> = SorterResult<T> | SorterResult<T>[];

export type CRouteObject = Omit<RouteObject, "children"> & {
  title?: string;
  hidden?: boolean;
  children?: CRouteObject[];
  redirect?: string;
  fullPath?: string;
  activePath?: string;
  roles?: string[];
};
