import Search, { type SearchConfig } from "@/components/Search";
import useFetchList from "@/hooks/useFetchList";
import AsyncButton from "@/components/AsyncButton";
import type { TableColumnProps } from "antd";
import { Table } from "antd";
import AppStyled from "@/styles/AppStyled";
import useModal from "@/hooks/useModal";
import type { CustomModalProps } from "@/components/CustomModal";
import CustomModal from "@/components/CustomModal";
import { fetchMockList } from "@/api";

interface SearchFormData {
  date?: [string, string];
  name?: string;
}

const searchOptions: SearchConfig = [
  { label: "姓名", key: "name", props: { allowClear: true } },
  { label: "时间", key: "date", type: "dateRange", props: { showTime: true } },
];

const TestModal: React.FC<CustomModalProps<any>> = props => {
  return <CustomModal {...props} />;
};

const App: React.FC = () => {
  const [setPageInfo, state, api] = useFetchList(fetchMockList, { initParams: { body: {} } });

  const openModal = useModal(TestModal);

  const columns: TableColumnProps<any>[] = [
    {
      title: "姓名",
      dataIndex: "name",
    },
    {
      title: "性别",
      dataIndex: "sex",
    },
    {
      title: "test",
      dataIndex: "test",
    },
    {
      title: "日期",
      width: 240,
      dataIndex: "date",
    },
    {
      title: "日期范围",
      width: 480,
      dataIndex: "dateRange",
      render: v => v?.join(" - "),
    },
    {
      title: "钱包",
      dataIndex: "data.money",
    },
    {
      title: "描述",
      dataIndex: "desc",
    },
    { title: "defaultEmpty" },
    {
      title: "操作",
      render: () => <></>,
    },
  ];

  function formatSearchParams(data: SearchFormData) {
    const { date, ...params } = data;
    const [deliveryTimeBegin, deliveryTimeEnd] = date || [];
    return {
      body: {
        ...params,
        deliveryTimeBegin,
        deliveryTimeEnd,
      },
    };
  }

  return (
    <AppStyled>
      <Search
        labelWidth={100}
        loading={state.loading}
        config={searchOptions}
        onSearch={state => api.doSearch(formatSearchParams(state))}
        onReset={state => api.doSearch(formatSearchParams(state), { resetPageSize: true })}
      />

      <div className="flex gap-4 mt-4">
        <AsyncButton type="primary" ghost>
          导出
        </AsyncButton>

        <AsyncButton
          onClick={() =>
            openModal({
              title: "哈哈哈",
              onConfirm: () => new Promise(rev => setTimeout(rev, 1000)),
            })
          }
        >
          Test
        </AsyncButton>
      </div>

      <Table
        tableLayout="fixed"
        bordered
        className="mt-4"
        loading={state.loading}
        dataSource={state.list}
        columns={columns}
        rowKey="id"
        scroll={{ x: columns.reduce((c, i) => c + ((i.width as number) || 125), 0) }}
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
    </AppStyled>
  );
};

export default App;
