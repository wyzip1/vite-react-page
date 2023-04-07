import React, { useState } from "react";
import { Button } from "antd";
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
    render(sex: -1 | 1 | 0) {
      return ["女", "男"][sex] || "未知";
    },
  },
  { title: "详情", dataIndex: "desc" },
];

export default function List() {
  const [dataList, setDataList] = useState<TableData[]>([]);
  const [total, setTotal] = useState<number>(0);

  const onSearch = async (
    formData: FormData,
    pageOptions: PageOptions,
    sorterOption: SorterOption
  ) => {
    console.log(formData, pageOptions, sorterOption);
    const res = await getTableList({ ...formData, ...pageOptions, sorterOption });
    if (res.code !== 200) throw res.msg;
    setDataList(res.data?.list || []);
    setTotal(res.data?.total || 0);
    return res.data!;
  };

  const batchAction = (data?: TableData[]) => {
    console.log(data);
  };

  return (
    <PageList
      searchOptions={SearchOptions}
      rowKey="id"
      doSearch={onSearch}
      showSelection
      columns={columns}
      batchControl={getData => <Button onClick={() => batchAction(getData())}>TEST</Button>}
      dataSource={dataList}
      total={total}
    />
  );
}
