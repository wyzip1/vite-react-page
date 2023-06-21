import { RouterComponentProps } from "@/components/RenderRouter";
import { SorterResult } from "antd/es/table/interface";
import type { LazyExoticComponent, FC } from "react";

export interface router {
  hidden?: boolean;
  title?: string;
  name?: string;
  role?: string[];
  redirect?: string;
  path: string;
  component?: LazyExoticComponent<FC<RouterComponentProps>>;
  children?: router[];
  activePath?: string;
}

export type SortType<T> = SorterResult<T> | SorterResult<T>[];
