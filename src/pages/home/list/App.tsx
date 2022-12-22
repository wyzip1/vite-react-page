import React from "react";
import PageList, { PageOptions, SorterOption } from "coms/PageList/index";

import SearchOptions, { FormData } from "./searchOptions";
import { getTableList, TableData } from "./mock";

import type { ColumnsType } from "antd/es/table";

const columns: ColumnsType<TableData> = [
  { title: "序号", dataIndex: "id", sorter: { multiple: 1 } },
  { title: "名称", dataIndex: "name" },
  {
    title: "性别",
    dataIndex: "sex",
    sorter: { multiple: 2 },
    render(sex) {
      return ["女", "男"][sex] || "未知";
    },
  },
  { title: "详情", dataIndex: "desc" },
];

export default function List() {
  const onSearch = async (
    formData: FormData,
    pageOptions: PageOptions,
    sorterOption: SorterOption
  ) => {
    console.log("sorterOption", sorterOption);
    const res = await getTableList({ ...formData, ...pageOptions, sorterOption });
    if (res.code !== 200) throw res.msg;
    return res.data!;
  };

  return (
    <PageList
      searchOptions={SearchOptions}
      rowKey="id"
      doSearch={onSearch}
      columns={columns}
    />
  );
}
