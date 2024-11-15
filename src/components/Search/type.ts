import type { InputProps, SelectProps, DatePickerProps, CascaderProps } from "antd";
import { type RangePickerProps } from "antd/es/date-picker";

export interface ComOptions<T = "input", P = {}> {
  label: string;
  key: string;
  width?: number | string;
  labelWidth?: number | string;
  type?: T;
  props?: P;
  defaultValue?: unknown;
  component?: (onChange: ChangeState, value: any, search: () => void) => JSX.Element;
}

export type State = { [key: string]: any };
export type ChangeState = (value: unknown) => void;

export type inputOptions = ComOptions<"input", InputProps>;
export type selectProps = ComOptions<"select", SelectProps>;
export type dateProps = ComOptions<"date", DatePickerProps>;
export type dateRangeProps = ComOptions<"dateRange", RangePickerProps>;
export type cascaderProps = ComOptions<"cascader", CascaderProps>;

export type Options = inputOptions | selectProps | dateRangeProps | dateProps | cascaderProps;
export type Config = Options[][];

export interface SearchProps {
  inline?: boolean;
  config: Options[][];
  defaultLabelWidth?: number | string;
  loading?: boolean;
  onChange?(state: State): void;
  onSearch(state: State): void;
  onReset?(state: State): void;
  searchBtnExtend?: React.ReactNode;
  actionStyle?: React.CSSProperties;
  actionClassName?: string;
  autoWrap?: boolean;
}

export interface SearchInstance {
  getFormData(): State;
  resetFormData: () => void;
}

interface RenderBaseProps {
  state: State;
  search(): void;
  setState: React.Dispatch<React.SetStateAction<State>>;
}

export interface RenderItemProps extends RenderBaseProps {
  options: Options;
}

export interface RenderRowProps extends RenderBaseProps {
  options: Options[];
}

type ITEM<T> = T extends { key: infer V extends string } ? V : never;
type OPTION<T> = T extends Array<infer V> ? V : never;
export type Form<T extends Config> =
  T extends Array<infer V> ? Record<ITEM<OPTION<V>>, unknown> : never;
