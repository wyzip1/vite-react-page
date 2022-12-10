import type { InputProps, SelectProps } from "antd";
import type { Dispatch, SetStateAction } from "react";
import type React from "react";

export interface ComOptions<T = "input", P = {}> {
  label: string;
  key: string;
  width?: number | string;
  type?: T;
  props?: P;
  component?: (
    onChange: ChangeState,
    value: string | unknown,
    search: () => void
  ) => JSX.Element;
}

export type State = { [key: string]: unknown };
export type ChangeState = (value: unknown) => void;

export type inputOptions = ComOptions<"input", InputProps>;
export type selectProps = ComOptions<"select", SelectProps>;

export type Options = inputOptions | selectProps;
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
