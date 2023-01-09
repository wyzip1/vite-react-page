import type React from "react";
import type { InputProps, SelectProps } from "antd";
import type { Dispatch, SetStateAction } from "react";
import type { RangePickerProps } from "antd/es/date-picker/generatePicker";
import type { Dayjs } from "dayjs";

export interface ComOptions<T = "input", P = {}> {
  label: string;
  key: string;
  width?: number | string;
  type?: T;
  props?: P;
  defaultValue?: unknown;
  component?: (onChange: ChangeState, value: any, search: () => void) => JSX.Element;
}

export type State = { [key: string]: unknown };
export type ChangeState = (value: unknown) => void;

export type inputOptions = ComOptions<"input", InputProps>;
export type selectProps = ComOptions<"select", SelectProps>;
export type dateRangeProps = ComOptions<"date", RangePickerProps<Dayjs>>;

export type Options = inputOptions | selectProps | dateRangeProps;
export type Config = Options[][];

export interface SearchProps {
  config: Options[][];
  defaultLabelWidth?: number | string;
  loading?: boolean;
  onChange?(state: State): void;
  onSearch(state: State): void;
  onReset?(state: State): void;
  searchBtnExtend?: React.ReactNode;
}

interface RenderBaseProps {
  state: State;
  search(): void;
  setState: Dispatch<SetStateAction<State>>;
}

export interface RenderItemProps extends RenderBaseProps {
  options: Options;
}

export interface RenderRowProps extends RenderBaseProps {
  options: Options[];
}

type ITEM<T> = T extends { key: infer V extends string } ? V : never;
type OPTION<T> = T extends Array<infer V> ? V : never;
export type Form<T extends Config> = T extends Array<infer V>
  ? Record<ITEM<OPTION<V>>, unknown>
  : never;
