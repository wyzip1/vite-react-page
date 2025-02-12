import { cloneElement, isValidElement } from "react";
import { Button, Form, Table, TableColumnProps } from "antd";
import AsyncButton from "../AsyncButton";

import renderEditContent, { formatToDayjs } from "./renderEditContent";
import { getValue, guid, setValue } from "@/utils";

import type {
  EditTableColumn,
  EditTableInstance,
  EditTableProps,
  EditValueOption,
  EventRange,
} from "./types";
import type { ColumnsType } from "antd/es/table";
import { Dayjs } from "dayjs";

const ProxyNode = <T extends JSX.Element>({
  children,
  proxy,
  ...props
}: {
  children?: T;
  proxy?: (props: any) => T["props"];
  [key: string]: any;
}) => {
  const proxyNode = isValidElement(children) ? (
    cloneElement(children, { ...props, ...proxy?.(props) })
  ) : (
    <>{children}</>
  );
  return <>{proxyNode}</>;
};

const EditTable = <T extends any>(
  {
    columns,
    defaultEmptyColumn,
    dataSource,
    createEditRecord,
    onSaveRecord,
    ...props
  }: EditTableProps<T>,
  ref: React.ForwardedRef<EditTableInstance<T>>,
) => {
  const [editRecords, setEditRecords] = useState<Record<string, Partial<T>>>({});
  const rowKey = useMemo(() => (props.rowKey as string) || "id", [props.rowKey]);
  const formInstance = Form.useFormInstance();
  const [_form] = Form.useForm();
  const form = formInstance || _form;

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
      ...Object.keys(editRecords)
        .filter(id => !dataSource?.some(v => v[rowKey]?.toString() === id))
        .map(id => ({
          ...editRecords[id],
          [rowKey]: id,
        })),
      ...(dataSource || []),
    ],
    [dataSource, editRecords, rowKey],
  );

  function renderEditAction(record: T) {
    return (
      <>
        <AsyncButton
          type="link"
          size="small"
          onClick={() => form.validateFields().then(() => saveEditItem(record[rowKey]))}
        >
          保存
        </AsyncButton>
        <Button type="link" size="small" onClick={() => cancelEditItem(record[rowKey])}>
          取消
        </Button>
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

    const onChange = (v: any) => {
      // @ts-ignore
      column.valueProps?.onChange?.(v);
      const value = v?.target ? v.target.value : formatDayJSValue(v, column);
      setValue(editRecords[record[rowKey]], value, column.dataIndex as any);
      setEditRecords({ ...editRecords });
    };

    return (
      <Form.Item
        style={{ marginBlock: -5 }}
        name={record[rowKey] + "-" + column.dataIndex || ""}
        {...column.formItemProps}
      >
        {
          <ProxyNode proxy={() => ({ onChange })}>
            {column.customEdit !== undefined ? (
              <column.customEdit />
            ) : (
              renderEditContent({
                type: column.valueType,
                props: column.valueProps || {},
              } as EditValueOption)
            )}
          </ProxyNode>
        }
      </Form.Item>
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

    return column.render?.(...renderArgs) ?? value ?? column.empty ?? defaultEmptyColumn;
  }

  async function saveEditItem(key: React.Key) {
    const editRecord = { ...editRecords[key as string] };
    await onSaveRecord?.(editRecord as T);

    cancelEditItem(key);
  }

  function addEditItem() {
    if (typeof createEditRecord !== "function") return;
    setEditRecords({ [guid()]: createEditRecord(), ...editRecords });
  }

  const isStartEditRef = useRef(false);

  function startEditItem(key: React.Key) {
    const record = dataList.find(v => v[rowKey] === key);
    if (!record) return;
    setEditRecords({ ...editRecords, [key as string]: JSON.parse(JSON.stringify(record)) });
    isStartEditRef.current = true;
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

  useEffect(() => {
    if (!isStartEditRef.current) return;
    isStartEditRef.current = false;
    const data = Object.keys(form.getFieldsValue()).reduce<Record<string, any>>((map, v) => {
      const [id, k] = v.split("-");
      let value: any = getValue(editRecords[id], k as any);
      const valueType = columns.find(v => v.dataIndex === k)?.valueType;
      if (valueType === "date") {
        value = formatToDayjs(value);
      } else if (valueType === "dateRange") {
        value = value ? [formatToDayjs(value[0]), formatToDayjs(value[1])] : value;
      }
      return { ...map, [id + "-" + k]: value };
    }, {});
    form.resetFields();

    form.setFieldsValue(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editRecords]);

  const TableNode = (
    <Table
      tableLayout="fixed"
      {...props}
      rowKey={rowKey}
      dataSource={dataList as T[]}
      columns={EditColumns as ColumnsType<T>}
      pagination={Object.keys(editRecords).length > 0 ? false : props.pagination}
    />
  );

  return formInstance ? (
    TableNode
  ) : (
    <Form form={_form} component={false}>
      {TableNode}
    </Form>
  );
};

export default forwardRef(EditTable) as unknown as <T = any>(
  props: React.PropsWithChildren<EditTableProps<T>> & React.RefAttributes<EditTableInstance>,
) => React.ReactElement;
