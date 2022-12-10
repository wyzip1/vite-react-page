import type { SorterOption } from "src/components/PageList";

const TemplateData = [
  { id: 1, name: "Lark", sex: -1, desc: "是个奇怪的人" },
  { id: 2, name: "Kara", sex: 0, desc: "是个奇怪的人" },
  { id: 3, name: "Tita", sex: 0, desc: "是个奇怪的人" },
  { id: 4, name: "Mosi", sex: 0, desc: "是个奇怪的人" },
  { id: 5, name: "Hanni", sex: 1, desc: "是个奇怪的人" },
  { id: 6, name: "Jack", sex: 1, desc: "是个奇怪的人" },
  { id: 7, name: "WuZhao", sex: 1, desc: "是个奇怪的人" },
  { id: 8, name: "YanJiu", sex: 0, desc: "是个奇怪的人" },
  { id: 9, name: "庚厉", sex: 1, desc: "是个奇怪的人" },
  { id: 10, name: "全峰话", sex: 1, desc: "是个奇怪的人" },
  { id: 11, name: "亘人", sex: 1, desc: "是个奇怪的人" },
  { id: 12, name: "👴", sex: -1, desc: "是个奇怪的人" },
  { id: 13, name: "🐮", sex: -1, desc: "是个奇怪的人" },
];

interface RequestListParams {
  name?: string;
  sex?: 0 | 1 | -1;
  pageNum: number;
  pageSize: number;
  sorterOption?: SorterOption;
}

export interface TableData {
  id: number;
  sex: number;
  name: string;
  desc: string;
}

const sortFn = (a: number, b: number, type: "ascend" | "descend"): number => {
  return type === "ascend" ? a - b : b - a;
};

const handleQueryList = ({ sex, name, sorterOption = [] }: RequestListParams) => {
  const filterList = [...TemplateData].filter(data => {
    const filterName = data.name.includes(name || "");
    const filterSex = data.sex === sex || sex === undefined;
    return filterName && filterSex;
  });
  for (const sorter of sorterOption) {
    filterList.sort((a, b) => sortFn(a[sorter.field], b[sorter.field], sorter.type));
  }
  return filterList;
};

export const getTableList = (
  params: RequestListParams
): Promise<{
  code: number;
  msg: string;
  data?: {
    list: TableData[];
    total: number;
  };
}> => {
  return new Promise(rev => {
    setTimeout(() => {
      const random = Math.floor(Math.random() * 100 + 1);
      if (random > 90) return rev({ code: 500, msg: "随机错误信息" });

      const filterList = handleQueryList(params);
      const result = filterList.slice(
        (params.pageNum - 1) * params.pageSize,
        params.pageNum * params.pageSize
      );

      rev({
        code: 200,
        msg: "请求成功",
        data: {
          list: result,
          total: filterList.length,
        },
      });
    }, 300);
  });
};
