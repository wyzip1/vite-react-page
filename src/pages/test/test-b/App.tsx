import React, { useState } from "react";
import Action from "@/components/Action";
import ActionToForm from "@/components/ActionToForm";

export default function Test() {
  const [count, setCount] = useState<number>(0);

  return (
    <>
      catch count: {count}
      <Action btnProps={{ onClick: () => setCount(count + 1), type: "primary" }}>count</Action>
      <Action confirmProps={{ title: "123123" }}>TestB</Action>
      <ActionToForm
        modalTitle="测试表单"
        formProps={{
          onSubmit: async data => {
            console.log("data", data);
            return Promise.reject();
          },
          itemConfig: [
            {
              type: "input",
              itemProps: {
                label: "用户名称：",
                name: "name",
              },
              valueProps: {
                placeholder: "请输入用户名称",
              },
            },
            {
              type: "checkbox",
              valueList: [
                { label: "test-1", value: 0 },
                { label: "test-2", value: 1 },
                { label: "test-3", value: 2 },
                { label: "test-4", value: 3 },
              ],

              itemProps: {
                initialValue: [3],
                label: "选项1",
                name: "options",
              },
            },
          ],
        }}
      >
        TestB
      </ActionToForm>
    </>
  );
}
