import React, {
  ForwardedRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import Search from "coms/Search";
import { Table } from "antd";

import type { Config, State } from "coms/Search/type";
import type { TablePaginationConfig } from "antd/es/table";
import type { TableRowSelection } from "antd/es/table/interface";
import type {
  ColumnsType,
  FilterValue,
  TableCurrentDataSource,
} from "antd/es/table/interface";
import type { SortType } from "src/types";

interface SearchResult<DataType> {
  list: DataType[];
  total: number;
}

export interface PageOptions {
  pageNum: number;
  pageSize: number;
}

interface PageInstace<T> {
  setList: React.Dispatch<React.SetStateAction<T[]>>;
  search(): Promise<void>;
  reset(): void;
}

interface PageProps<DataType> {
  searchOptions: Config;
  doSearch(
    formData: State,
    pageOptions: PageOptions,
    sorter: SortType<DataType>,
    isReset: boolean
  ): SearchResult<DataType> | Promise<SearchResult<DataType>>;
  columns: ColumnsType<DataType>;
  rowKey?: string;
  showSelection?: boolean | "checkbox" | "radio";
  searchBtnExtend?: React.ReactNode;
  disabledName?: keyof DataType;
  batchControl?: (selectedRowData?: DataType[]) => React.ReactNode;
  toRef?: ForwardedRef<PageInstace<DataType>>;
}

export interface Sorter {
  field: string;
  type: "ascend" | "descend";
}

export type SorterOption = Sorter[];

export default function Page<DataType extends object = {}>({
  searchOptions,
  doSearch,
  columns,
  rowKey,
  searchBtnExtend,
  showSelection,
  disabledName,
  batchControl,
  toRef,
}: PageProps<DataType>) {
  const [formData, setFormData] = useState<State>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<DataType[]>([]);
  const [pageNum, setPageNum] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [sorter, setSorter] = useState<SortType<DataType>>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([]);
  const [selectedRowData, setSelectedRowData] = useState<DataType[]>([]);

  const covertSorter = (sorter: SortType<DataType>): SorterOption => {
    let option: SortType<DataType>;
    if (Array.isArray(sorter)) option = sorter;
    else option = [sorter];
    return option
      .filter(item => item.field && item.order)
      .map(item => ({
        field: item.field! as string,
        type: item.order!,
      }));
  };

  const onSearch = async (
    formData: State,
    pageOptions: PageOptions = { pageNum, pageSize }
  ) => {
    try {
      setLoading(true);
      const sorterOption = covertSorter(sorter);
      const { list, total } = await doSearch(formData, pageOptions, sorterOption, false);
      setList(list);
      setTotal(total);
    } catch (error) {
      console.group("Page Component doSearch Catch Error:");
      console.log(error);
      console.groupEnd();
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    setPageNum(1);
    setPageSize(10);
    onSearch({}, { pageNum: 1, pageSize: 10 });
  };

  useImperativeHandle(toRef, () => ({
    setList,
    search: () => onSearch(formData),
    reset: onReset,
  }));

  useEffect(() => {
    if (loading) return;
    onSearch(formData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum, pageSize, sorter]);

  const TableChange = (
    pageOptions: TablePaginationConfig,
    filter: Record<string, FilterValue | null>,
    sorter: SortType<DataType>,
    extra: TableCurrentDataSource<DataType>
  ) => {
    pageOptions.current && setPageNum(pageOptions.current);
    pageOptions.pageSize && setPageSize(pageOptions.pageSize);
    setSorter(sorter);
  };

  const rowSelection = useMemo<TableRowSelection<DataType> | undefined>(() => {
    if (!showSelection) return;
    const options: TableRowSelection<DataType> = {};
    if (showSelection === true) options.type = "checkbox";
    else options.type = showSelection;
    options.selectedRowKeys = selectedRowKeys;
    options.onChange = (selectedKeys, selectedData) => {
      setSelectedRowKeys(selectedKeys);
      setSelectedRowData(selectedData);
    };
    const disbaledFn = (record: DataType) => ({
      disabled: Boolean(record[disabledName!]),
    });
    options.getCheckboxProps = disabledName === undefined ? undefined : disbaledFn;
    return options;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSelection, selectedRowKeys]);

  return (
    <div>
      <Search
        loading={loading}
        config={searchOptions}
        onSearch={onSearch}
        onChange={setFormData}
        onReset={onReset}
        searchBtnExtend={searchBtnExtend}
      />
      {batchControl && (
        <div style={{ marginTop: 15 }}>{batchControl(selectedRowData)}</div>
      )}
      <Table
        style={{ marginTop: 15 }}
        bordered
        loading={loading}
        dataSource={list}
        columns={columns}
        rowKey={rowKey}
        rowSelection={rowSelection}
        pagination={{
          pageSizeOptions: [10, 20, 30],
          current: pageNum,
          pageSize,
          total,
          showQuickJumper: true,
          showSizeChanger: true,
          showTotal: total => `共${total}条`,
        }}
        onChange={TableChange}
      />
    </div>
  );
}
