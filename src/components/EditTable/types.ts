import Path from "@/utils/path";
import {
  InputNumberProps,
  InputProps,
  SelectProps,
  SwitchProps,
  TableColumnProps,
  TableProps,
} from "antd";
import { DatePickerProps, RangePickerProps } from "antd/es/date-picker";
import React from "react";

type EditOption<T, P> = {
  valueOption: { type: T; props: P };
  columnConfig: { valueType: T; valueProps: P };
};

type EditOptionMap =
  | EditOption<"string", InputProps>
  | EditOption<"number", InputNumberProps>
  | EditOption<"boolean", SwitchProps>
  | EditOption<"date", DatePickerProps>
  | EditOption<"dateRange", RangePickerProps>
  | EditOption<"select", SelectProps>;

export type EditValueOption = (EditOptionMap extends { valueOption: infer V } ? V : never) & {
  value: any;
};

export type EditTableColumn<T> = Omit<TableColumnProps<T>, "dataIndex" | "render"> &
  (
    | ({
        empty?: React.ReactNode;
        dataIndex?: Path<T>;
        render?: TableColumnProps<T>["render"];
      } & Partial<EditOptionMap extends { columnConfig: infer V } ? V : never>)
    | {
        dataIndex?: undefined;
        valueType: "action";
        render?: (editDom: JSX.Element, value: any, record: T, index: number) => JSX.Element;
      }
  );

export interface EditTableInstance<T = unknown> {
  editRecords: Record<string, Partial<T>>;
  addEditItem: () => void;
  startEditItem: (key: React.Key) => void;
  cancelEditItem: (key: React.Key) => void;
}

export interface EditTableProps<T = unknown> extends Omit<TableProps<T>, "columns"> {
  defaultEmptyColumn?: React.ReactNode;
  columns: EditTableColumn<T>[];
  createEditRecord?: () => Partial<T>;
  onSaveRecord?: (record: T) => any;
}
