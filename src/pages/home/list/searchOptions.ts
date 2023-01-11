import type { Config } from "coms/Search/type";
import type { Dayjs } from "dayjs";

const SearchOptions: Config = [
  [
    { label: "名称", key: "name", type: "input" },
    {
      label: "性别",
      key: "sex",
      type: "select",
      props: {
        allowClear: true,
        options: [
          { label: "未知", value: -1 },
          { label: "男", value: 1 },
          { label: "女", value: 0 },
        ],
      },
    },
  ],
  [
    {
      label: "时间范围",
      key: "date",
      type: "dateRange",
      props: {
        showTime: true,
      },
    },
  ],
];

export interface FormData {
  name?: string;
  sex?: 0 | 1 | -1;
  date?: [Dayjs | null, Dayjs | null] | null;
}

export default SearchOptions;
