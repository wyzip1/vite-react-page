import { SorterResult } from "antd/es/table/interface";
import type { LazyExoticComponent, CSSProperties, FC } from "react";

export interface defaultComponentProps {
  children?: null | number | string | JSX.Element;
  style?: CSSProperties;
  [key: string]: unknown;
}

export interface router {
  hidden?: boolean;
  title?: string;
  name?: string;
  role?: string[];
  redirect?: string;
  path: string;
  component?: LazyExoticComponent<FC<defaultComponentProps>>;
  children?: router[];
  _parent?: router;
  activePath?: string;
}

export type SortType<T> = SorterResult<T> | SorterResult<T>[];
