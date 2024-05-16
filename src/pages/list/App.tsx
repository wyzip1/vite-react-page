import Search from "@/components/Search";
import React, { useRef } from "react";
import { useMemo, useState } from "react";
import useFetchList from "@/hooks/useFetchList";
import { Config } from "@/components/Search/type";
import AsyncButton from "@/components/AsyncButton";
import { fetchMockList } from "@/api/index";
import EditTable from "@/components/EditTable";
import { MockListItem } from "@/api/mock-model";
import { Button } from "antd";
import { EditTableColumn, EditTableInstance } from "@/components/EditTable/types";

interface SearchFormData {
  date?: [string, string];
  name?: string;
}

const searchOptions: Config = [
  [
    { label: "姓名", key: "name", props: { allowClear: true } },
    { label: "时间", key: "date", type: "dateRange", props: { showTime: true } },
  ],
];

const App: React.FC = () => {
  const [searchFormData, setSearchFormData] = useState<SearchFormData>({});
  const searchParams = useMemo(() => formatSearchParams(searchFormData), [searchFormData]);
  const [setPageInfo, state, api] = useFetchList(fetchMockList, searchParams);

  const eidtTableRef = useRef<EditTableInstance>(null);

  const columns: EditTableColumn<MockListItem>[] = [
    {
      title: "姓名",
      dataIndex: "name",
      valueType: "string",
    },
    {
      title: "性别",
      dataIndex: "sex",
      valueType: "boolean",
      render(v) {
        return v === 0 ? "女" : v === 1 ? "男" : "未知";
      },
    },
    {
      title: "钱包",
      valueType: "number",
      dataIndex: "data.money",
    },
    {
      title: "描述",
      valueType: "string",
      dataIndex: "desc",
    },
    { title: "empty", empty: "-" },
    { title: "defaultEmpty" },
    {
      title: "操作",
      valueType: "action",
      render: edit => edit,
    },
  ];

  function formatSearchParams(data: SearchFormData) {
    const { date, ...params } = data;
    const [deliveryTimeBegin, deliveryTimeEnd] = date || [];
    return {
      ...params,
      deliveryTimeBegin,
      deliveryTimeEnd,
    };
  }

  function saveRecord(data: MockListItem) {
    const idx = state.list.findIndex(i => i.id === data.id);
    if (idx > -1) state.list[idx] = data;
    else state.list.push(data);
    api.updateList();
  }

  return (
    <div>
      <Search
        defaultLabelWidth={100}
        loading={state.loading}
        config={searchOptions}
        onChange={setSearchFormData}
        onSearch={() => api.doSearch()}
        onReset={state => {
          Object.assign(searchParams, formatSearchParams(state));
          api.doSearch();
        }}
      />

      <div className="flex gap-4 mt-4">
        <AsyncButton type="primary" ghost>
          导出
        </AsyncButton>

        <Button onClick={() => eidtTableRef.current?.addEditItem()}>添加数据</Button>
      </div>

      <EditTable
        tableLayout="fixed"
        ref={eidtTableRef}
        bordered
        className="mt-4"
        loading={state.loading}
        dataSource={state.list}
        defaultEmptyColumn={<div>暂无数据</div>}
        columns={columns}
        rowKey="id"
        scroll={{ x: columns.reduce((c, i) => c + ((i.width as number) || 200), 0) }}
        onChange={({ current, pageSize }) => {
          setPageInfo({ pageNum: current!, pageSize: pageSize! });
        }}
        onSaveRecord={saveRecord}
        createEditRecord={() => ({
          id: -1,
          name: "test-add",
        })}
        pagination={{
          current: state.pageNum,
          pageSize: state.pageSize,
          total: state.total,
          pageSizeOptions: ["10", "20", "30"],
          showPrevNextJumpers: true,
          showQuickJumper: true,
          showSizeChanger: true,
          showTotal: total => `共 ${total} 条`,
        }}
      />
    </div>
  );
};

export default App;
