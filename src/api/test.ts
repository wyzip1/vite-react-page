export const testApi = (params: any) => {
  return Promise.resolve({
    code: 0,
    message: "success",
    data: {
      list: [
        {
          id: 1,
          name: "张三",
          sex: 1,
          date: "2023-01-01 00:00:00",
          dateRange: ["2023-01-01 00:00:00", "2023-01-01 00:00:00"],
          data: { money: 100 },
          desc: "这是一个描述",
        },
      ],
      total: 0,
    },
  });
};
