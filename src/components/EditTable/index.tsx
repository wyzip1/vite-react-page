import React, {
  ForwardedRef,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { Button, Table, TableColumnProps } from "antd";
import AsyncButton from "../AsyncButton";

import renderEditContent from "./renderEditContent";
import { getValue, guid, setValue } from "@/utils";

import type {
  EditTableColumn,
  EditTableInstance,
  EditTableProps,
  EditValueOption,
  EventRange,
} from "./types";
import type { ColumnsType } from "antd/es/table";
import FormItem from "antd/es/form/FormItem";
import { Dayjs } from "dayjs";

const EditTable = <T extends any>(
  {
    columns,
    defaultEmptyColumn,
    dataSource,
    createEditRecord,
    onSaveRecord,
    ...props
  }: EditTableProps<T>,
  ref: ForwardedRef<EditTableInstance<T>>,
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
        .filter(id => !dataSource?.some(v => v[rowKey]?.toString() === id))
        .map(id => ({
          ...editRecords[id],
          [rowKey]: id,
        })),
    ],
    [dataSource, editRecords, rowKey],
  );

  function renderEditAction(record: T) {
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

  function formatDayJSValue(
    v: EventRange<Dayjs> | [EventRange<Dayjs>, EventRange<Dayjs>],
    column: EditTableColumn<T>,
  ) {
    if (column.valueType === "action") return v;
    if (!["date", "dateRange"].includes(column.valueType || "")) return v;

    const formatSetting = (column.valueProps as any)?.format || "YYYY-MM-DD";

    if (Array.isArray(v)) return [v[0]?.format(formatSetting), v[1]?.format(formatSetting)];
    return v?.format(formatSetting);
  }

  function renderEditModeRecord(column: EditTableColumn<T>, record: T) {
    if (column.valueType === "action") return renderEditAction(record);

    return (
      <FormItem style={{ marginBlock: -5 }}>
        {renderEditContent(
          {
            type: column.valueType,
            props: column.valueProps || {},
            value: getValue(editRecords[record[rowKey]], column.dataIndex as any),
          } as EditValueOption,
          v => {
            const value = formatDayJSValue(v, column);
            setValue(editRecords[record[rowKey]], value, column.dataIndex as any);
            setEditRecords({ ...editRecords });
          },
        )}
      </FormItem>
    );
  }

  function formatValue(value: any, column: EditTableColumn<T>) {
    switch (column.valueType) {
      case "select":
        return column.valueProps?.options?.find(v => v.value === value)?.label || value;

      default:
        return value;
    }
  }

  function defaultColumnRender(
    column: EditTableColumn<T>,
    renderArgs: [value: any, record: T, index: number],
  ) {
    const record = renderArgs[1];
    const value = column.renderIndex
      ? getValue(record, column.renderIndex)
      : formatValue(getValue(record, column.dataIndex), column);

    const isEditRecord =
      editRecords[record[rowKey]] !== undefined && column.valueType !== undefined;

    if (isEditRecord) return renderEditModeRecord(column, record);
    if (column.valueType === "action") {
      return column.render?.(
        <Button type="link" size="small" onClick={() => startEditItem(record[rowKey])}>
          编辑
        </Button>,
        ...renderArgs,
      );
    }

    return (
      <FormItem style={{ marginBlock: -5 }}>
        {column.render?.(...renderArgs) ?? value ?? column.empty ?? defaultEmptyColumn}
      </FormItem>
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
      tableLayout="fixed"
      {...props}
      rowKey={rowKey}
      dataSource={dataList}
      columns={EditColumns as ColumnsType}
      pagination={Object.keys(editRecords).length > 0 ? false : props.pagination}
    />
  );
};

export default forwardRef(EditTable) as unknown as <T = any>(
  props: React.PropsWithChildren<EditTableProps<T>> & React.RefAttributes<EditTableInstance>,
) => React.ReactElement;
