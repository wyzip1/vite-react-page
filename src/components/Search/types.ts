import type { CascaderAutoProps, DatePickerProps, InputProps, SelectProps } from "antd";
import type { RangePickerProps } from "antd/es/date-picker";

export type SearchValues = Record<string, any>;
export type SearchValueChange = (value: unknown) => void;

export interface SearchOptionBase<T, P> {
  label: React.ReactNode;
  key: string;
  type?: T;
  width?: number | string;
  minWidth?: number | string;
  labelWidth?: number | string;
  props?: P;
  defaultValue?: unknown;
  component?: (onChange: SearchValueChange, value: any, search: () => void) => React.ReactElement;
}

export type InputOption = SearchOptionBase<"input", InputProps>;
export type SelectOption = SearchOptionBase<"select", SelectProps>;
export type DateOption = SearchOptionBase<"date", DatePickerProps>;
export type DateRangeOption = SearchOptionBase<"dateRange", RangePickerProps>;
export type CascaderOption = SearchOptionBase<"cascader", CascaderAutoProps>;

export type SearchOption =
  InputOption | SelectOption | DateOption | DateRangeOption | CascaderOption;

export type SearchConfig = SearchOption[];

export interface SearchInstance {
  getFormData(): SearchValues;
  resetFormData(): void;
}

export interface SearchProps {
  ref?: React.Ref<SearchInstance>;
  config: SearchConfig;
  labelWidth?: number | string;
  minItemWidth?: number | string;
  maxItemsPerRow?: number;
  loading?: boolean;
  onChange?(values: SearchValues): void;
  onSearch(values: SearchValues): void;
  onReset?(values: SearchValues): void;
  searchBtnExtend?: React.ReactNode;
  actionStyle?: React.CSSProperties;
  actionClassName?: string;
  autoWrap?: boolean;
}

type OptionKey<T> = T extends { key: infer K extends string } ? K : never;
type ConfigOption<T> = T extends Array<infer V> ? V : never;

export type SearchFormValues<T extends SearchConfig> = Record<OptionKey<ConfigOption<T>>, unknown>;
