import type { IncomingMessage } from "http";
import type { MockMethod } from "vite-plugin-mock";
import { parse } from "url";

const sleep = (ms: number) => new Promise(rev => setTimeout(rev, ms));

const parseJsonBody = async (req: IncomingMessage) => {
  return new Promise<Record<string, any>>(resolve => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
    });
    req.on("end", () => {
      resolve(JSON.parse(body || "{}"));
    });
  });
};

const mockList = [
  {
    id: 1,
    name: "Lark",
    sex: -1,
    test: 2,
    date: "2022-02-02 00:00:00",
    dateRange: ["2022-02-02 00:00:00", "2022-02-03 00:00:00"],
    desc: "是个奇怪的人",
    data: { money: Math.floor(Math.random() * 2000) },
  },
  {
    id: 2,
    name: "Kara",
    sex: 0,
    desc: "是个奇怪的人",
    data: { money: Math.floor(Math.random() * 2000) },
  },
  {
    id: 3,
    name: "Tita",
    sex: 0,
    desc: "是个奇怪的人",
    data: { money: Math.floor(Math.random() * 2000) },
  },
  {
    id: 4,
    name: "Mosi",
    sex: 0,
    desc: "是个奇怪的人",
    data: { money: Math.floor(Math.random() * 2000) },
  },
  {
    id: 5,
    name: "Hanni",
    sex: 1,
    desc: "是个奇怪的人",
    data: { money: Math.floor(Math.random() * 2000) },
  },
  {
    id: 6,
    name: "Jack",
    sex: 1,
    desc: "是个奇怪的人",
    data: { money: Math.floor(Math.random() * 2000) },
  },
  {
    id: 7,
    name: "WuZhao",
    sex: 1,
    desc: "是个奇怪的人",
    data: { money: Math.floor(Math.random() * 2000) },
  },
  {
    id: 8,
    name: "YanJiu",
    sex: 0,
    desc: "是个奇怪的人",
    data: { money: Math.floor(Math.random() * 2000) },
  },
  {
    id: 9,
    name: "庚厉",
    sex: 1,
    desc: "是个奇怪的人",
    data: { money: Math.floor(Math.random() * 2000) },
  },
  {
    id: 10,
    name: "全峰话",
    sex: 1,
    desc: "是个奇怪的人",
    data: { money: Math.floor(Math.random() * 2000) },
  },
  {
    id: 11,
    name: "亘人",
    sex: 1,
    desc: "是个奇怪的人",
    data: { money: Math.floor(Math.random() * 2000) },
  },
  {
    id: 12,
    name: "👴",
    sex: -1,
    desc: "是个奇怪的人",
    data: { money: Math.floor(Math.random() * 2000) },
  },
  {
    id: 13,
    name: "🐮",
    sex: -1,
    desc: "是个奇怪的人",
    data: { money: Math.floor(Math.random() * 2000) },
  },
];

const mockMethods: MockMethod[] = [
  {
    url: "/developmentApi/api/list",
    method: "post",
    async rawResponse(req, res) {
      await sleep(1000);

      const body = await parseJsonBody(req);
      const query = parse(req.url!, true).query;
      const pageNum = Number(body.pageNum || query.pageNum);
      const pageSize = Number(body.pageSize || query.pageSize);
      const name = body.name || query.name;
      const filterList = name ? mockList.filter(item => item.name.includes(name)) : mockList;

      const result = {
        code: 200,
        message: "ok",
        data: {
          list: filterList.slice((pageNum - 1) * pageSize, pageNum * pageSize),
          total: filterList.length,
        },
      };
      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
      });
      res.end(JSON.stringify(result));
    },
  },
];

export default mockMethods;
