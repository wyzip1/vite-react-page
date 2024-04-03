import Search from "@/components/Search";
import React from "react";
import { useMemo, useState } from "react";
import useFetchList from "@/hooks/useFetchList";
import { Input, Table, TableColumnProps } from "antd";
import { Config } from "@/components/Search/type";
import AsyncButton from "@/components/AsyncButton";
import { fetchMockList } from "@/api/index";

interface SearchFormData {
  date?: [string, string];
  tid?: string;
  status?: string;
  erpTradeId?: string;
  buyerPhone?: string;
}

const searchOptions: Config = [
  [
    {
      label: "发货时间",
      width: 360,
      type: "dateRange",
      key: "date",
      props: { showTime: true },
    },
    { label: "买家手机号", key: "buyerPhone", props: { allowClear: true } },

    {
      label: "发货状态",
      key: "status",
      type: "select",
      width: 160,
      props: {
        allowClear: true,
        options: [
          { label: "待申请发货", value: 0 },
          { label: "已申请待发货", value: 1 },
          { label: "已发货", value: 2 },
        ],
      },
    },
  ],
  [
    { label: "万里牛订单号", width: 360, key: "erpTradeId", props: { allowClear: true } },
    {
      label: "有赞订单号",
      key: "tid",
      component(onChange, value, search) {
        return (
          <Input.TextArea
            style={{ width: 464 }}
            // autoSize={{ maxRows: 10 }}
            rows={3}
            placeholder="逗号，分隔批量查询"
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={e => {
              if (e.code !== "Enter") return;
              e.preventDefault();
              search();
            }}
          />
        );
      },
    },
  ],
];

const App: React.FC = () => {
  const [searchFormData, setSearchFormData] = useState<SearchFormData>({});
  const searchParams = useMemo(() => formatSearchParams(searchFormData), [searchFormData]);
  const [setPageInfo, state, api] = useFetchList(fetchMockList, searchParams);

  const columns: TableColumnProps<any>[] = [
    {
      title: "有赞订单号",
      align: "center",
      dataIndex: "tid",
    },
    {
      title: "买家信息",
      align: "center",
      render(_, record) {
        return record.buyerName + "/" + record.buyerPhone;
      },
    },
    {
      title: "加入背包时间",
      align: "center",
      dataIndex: "createTime",
    },
    {
      title: "商品信息",
      align: "center",
      dataIndex: "title",
      render(v, record) {
        const skuStr = JSON.parse(record.skuProperties || "[]")
          .map(i => i.v)
          .join("、");
        return v + "/" + skuStr;
      },
    },
    {
      title: "发货状态",
      align: "center",
      dataIndex: "status",
      render: v => ["待申请发货", "已申请待发货", "已发货"][v],
    },
    {
      title: "收货地址",
      align: "center",
      dataIndex: "receiverAddress",
    },
    {
      title: "自动发货剩余时间",
      align: "center",
      dataIndex: "surplusDeliveryDays",
    },
    {
      title: "发货时间",
      align: "center",
      dataIndex: "deliveryTime",
    },
    {
      title: "万里牛单号",
      align: "center",
      dataIndex: "erpTradeId",
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
