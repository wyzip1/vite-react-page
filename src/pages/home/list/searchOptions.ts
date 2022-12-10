import type { Config } from "coms/Search/type";

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
];

export interface FormData {
  name?: string;
  sex?: 0 | 1 | -1;
}

export default SearchOptions;
