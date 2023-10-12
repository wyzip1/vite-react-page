import type { MockMethod } from "vite-plugin-mock";

const mockList = [
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

const mockMethods: MockMethod[] = [
  {
    url: "/developmentApi/api/list",
    method: "post",
    response: ({ body }) => {
      return {
        resultStatus: 200,
        resultCode: "",
        resultMessage: "ok",
        data: {
          list: mockList.slice(
            (body.pageNum - 1) * body.pageSize,
            body.pageNum * body.pageSize
          ),
          total: mockList.length,
        },
      };
    },
  },
];

export default mockMethods;
