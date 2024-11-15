import Search from "@/components/Search";
import useFetchList from "@/hooks/useFetchList";
import { Config } from "@/components/Search/type";
import AsyncButton from "@/components/AsyncButton";
import { fetchMockList } from "@/api/index";
import EditTable from "@/components/EditTable";
import { MockListItem } from "@/api/mock-model";
import { Button } from "antd";
import { EditTableColumn, EditTableInstance } from "@/components/EditTable/types";
import AppStyled from "@/styles/AppStyled";
import useModal from "@/hooks/useModal";
import CustomModal, { CustomModalProps } from "@/components/CustomModal";
import { useThemeMode } from "@/store/theme";

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

const TestModal: React.FC<CustomModalProps<any>> = props => {
  const themeMode = useThemeMode();

  useEffect(() => {
    console.log("themeMode", themeMode);
  }, [themeMode]);

  return <CustomModal {...props} />;
};

const App: React.FC = () => {
  const [searchFormData, setSearchFormData] = useState<SearchFormData>({});
  const searchParams = useMemo(() => formatSearchParams(searchFormData), [searchFormData]);
  const [setPageInfo, state, api] = useFetchList(fetchMockList, searchParams);

  const { openModal } = useModal(TestModal);

  const eidtTableRef = useRef<EditTableInstance>(null);

  const columns: EditTableColumn<MockListItem>[] = [
    {
      title: "姓名",
      dataIndex: "name",
      valueType: "string",
      formItemProps: {
        rules: [{ required: true, message: "请输入姓名" }],
      },
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
      title: "test",
      dataIndex: "test",
      valueType: "select",
      valueProps: {
        options: [
          { label: "name1", value: 1 },
          { label: "name2", value: 2 },
        ],
      },
    },
    {
      title: "日期",
      width: 240,
      dataIndex: "date",
      valueType: "date",
      valueProps: {
        format: "YYYY-MM-DD HH:mm:ss",
        showTime: true,
      },
    },
    {
      title: "日期范围",
      width: 480,
      dataIndex: "dateRange",
      valueType: "dateRange",
      valueProps: {
        format: "YYYY-MM-DD HH:mm:ss",
        showTime: true,
      },
      render: v => v?.join(" - "),
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
    <AppStyled>
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
    </AppStyled>
  );
};

export default App;
