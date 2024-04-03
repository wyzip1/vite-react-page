import Search from "@/components/Search";
import React from "react";
import { useMemo, useState } from "react";
import useFetchList from "@/hooks/useFetchList";
import { Table, TableColumnProps } from "antd";
import { Config } from "@/components/Search/type";
import AsyncButton from "@/components/AsyncButton";
import { fetchMockList } from "@/api/index";

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

  const columns: TableColumnProps<any>[] = [
    {
      title: "姓名",
      align: "center",
      dataIndex: "name",
    },
    {
      title: "性别",
      align: "center",
      dataIndex: "sex",
      render(v) {
        return v === 0 ? "女" : v === 1 ? "男" : "未知";
      },
    },
    {
      title: "描述",
      align: "center",
      dataIndex: "desc",
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
      </div>

      <Table
        bordered
        className="mt-4"
        loading={state.loading}
        dataSource={state.list}
        columns={columns}
        rowKey="id"
        scroll={{ x: columns.reduce((c, i) => c + ((i.width as number) || 200), 0) }}
        onChange={({ current, pageSize }) => {
          setPageInfo({ pageNum: current!, pageSize: pageSize! });
        }}
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
