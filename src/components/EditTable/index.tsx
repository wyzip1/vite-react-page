import { getValue, guid, setValue } from "@/utils";
import Path from "@/utils/path";
import {
  Button,
  DatePicker,
  DatePickerProps,
  Input,
  InputNumber,
  InputNumberProps,
  InputProps,
  Select,
  SelectProps,
  Switch,
  SwitchProps,
  Table,
  TableColumnProps,
  TableProps,
} from "antd";
import { ColumnsType } from "antd/es/table";
import React, {
  ForwardedRef,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { RangePickerProps } from "antd/es/date-picker";
import AsyncButton from "../AsyncButton";

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

type EditValueOption = (EditOptionMap extends { valueOption: infer V } ? V : never) & {
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

function renderEditContent(
  { type, props, value }: EditValueOption,
  commonChange?: (value: any) => any
) {
  const originPropsOnChange = props.onChange as ((...args: any) => any) | undefined;
  const onChange = async (...args: any[]) => {
    await originPropsOnChange?.(...args);
    if (type === "string") await commonChange?.(args[0].target.value);
    else await commonChange?.(args[0]);
  };
  props.onChange = onChange;

  switch (type) {
    case "string":
      return <Input {...props} value={value} />;
    case "number":
      return <InputNumber {...props} value={value} />;
    case "boolean":
      return <Switch {...props} value={value} />;
    case "date":
      return <DatePicker {...props} value={value} />;
    case "dateRange":
      return <DatePicker.RangePicker {...props} value={value} />;
    case "select":
      return <Select {...props} value={value} />;
  }
}

const EditTable = <T extends any>(
  {
    columns,
    defaultEmptyColumn,
    dataSource,
    createEditRecord,
    onSaveRecord,
    ...props
  }: EditTableProps<T>,
  ref: ForwardedRef<EditTableInstance<T>>
) => {
  const [editRecords, setEditRecords] = useState<Record<string, Partial<T>>>({});

  const rowKey = useMemo(() => (props.rowKey as string) || "id", [props.rowKey]);

  const EditColumns = useMemo<
    (Omit<EditTableColumn<T>, "render"> & { render: TableColumnProps<T>["render"] })[]
  >(() => {
    return columns?.map(column => ({
      ...column,
      render: (...renderArgs: [value: any, record: T, index: number]) =>
        defaultColumnRender(column, renderArgs),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, editRecords]);

  const dataList = useMemo(
    () => [
      ...(dataSource || []),
      ...Object.keys(editRecords)
        .filter(id => !dataSource?.some(v => v[rowKey].toString() === id))
        .map(id => ({
          ...editRecords[id],
          [rowKey]: id,
        })),
    ],
    [dataSource, editRecords, rowKey]
  );

  function defaultColumnRender<T>(
    column: EditTableColumn<T>,
    renderArgs: [value: any, record: T, index: number]
  ) {
    const record = renderArgs[1];
    const value = getValue(record, column.dataIndex);

    if (editRecords[record[rowKey]] === undefined || !column.valueType) {
      if (column.valueType === "action") {
        return column.render?.(
          <Button type="link" size="small" onClick={() => startEditItem(record[rowKey])}>
            编辑
          </Button>,
          ...renderArgs
        );
      }
      return (column.render?.(...renderArgs) ??
        value ??
        column.empty ??
        defaultEmptyColumn) as JSX.Element;
    }

    if (column.valueType === "action") {
      return (
        <>
          <Button type="link" size="small" onClick={() => cancelEditItem(record[rowKey])}>
            取消
          </Button>
          <AsyncButton type="link" size="small" onClick={() => saveEditItem(record[rowKey])}>
            保存
          </AsyncButton>
        </>
      );
    }

    return renderEditContent(
      {
        type: column.valueType,
        props: column.valueProps || {},
        value: getValue(editRecords[record[rowKey]], column.dataIndex as any),
      } as EditValueOption,
      v => {
        setValue(editRecords[record[rowKey]], v, column.dataIndex as any);
        setEditRecords({ ...editRecords });
      }
    );
  }

  async function saveEditItem(key: React.Key) {
    const editRecord = { ...editRecords[key as string] };
    await onSaveRecord?.(editRecord as T);

    cancelEditItem(key);
  }

  function addEditItem() {
    if (typeof createEditRecord !== "function") return;
    setEditRecords({ ...editRecords, [guid()]: createEditRecord() });
  }

  function startEditItem(key: React.Key) {
    const record = dataList.find(v => v[rowKey] === key);
    if (!record) return;
    setEditRecords({ ...editRecords, [key as string]: JSON.parse(JSON.stringify(record)) });
  }

  function cancelEditItem(key: React.Key) {
    delete editRecords[key as string];
    setEditRecords({ ...editRecords });
  }

  useImperativeHandle(ref, () => ({
    editRecords,
    addEditItem,
    startEditItem,
    cancelEditItem,
  }));

  return (
    <Table
      {...props}
      dataSource={dataList}
      columns={EditColumns as ColumnsType}
      pagination={Object.keys(editRecords).length > 0 ? false : props.pagination}
    />
  );
};

export default forwardRef(EditTable) as unknown as <T = any>(
  props: React.PropsWithChildren<EditTableProps<T>> & React.RefAttributes<EditTableInstance>
) => React.ReactElement;
