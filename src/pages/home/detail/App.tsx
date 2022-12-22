import React from "react";
import Action from "coms/Action";
import ActionToForm from "coms/ActionToForm";
import Form from "coms/Form";

import type { ItemConfig } from "coms/Form";
import type { FormProps } from "antd";

const itemOptions: ItemConfig[] = [
  {
    type: "input",
    itemProps: {
      label: "文本",
      name: "text",
      required: true,
      rules: [{ required: true, message: "请输入文本" }],
    },
  },
  {
    type: "select",
    itemProps: {
      label: "下拉选项",
      name: "select",
      required: true,
      rules: [{ required: true, message: "请选择选项" }],
    },
    valueProps: {
      allowClear: true,
      options: [
        { label: "选项一", value: 1 },
        { label: "选项二", value: 2 },
        { label: "选项三", value: 3 },
      ],
    },
  },
];

const formOptions: FormProps = {
  labelAlign: "right",
  labelCol: { span: 6 },
};

interface FormData {
  select: number;
  text: string;
}

interface ActionFormData {
  user?: string;
}

export default function Detail() {
  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  const ActionOnSubmit = (data: ActionFormData) => {
    return new Promise(rev => {
      console.log("data", data);
      console.log("mock fetch");
      setTimeout(() => rev, 3000);
    });
  };

  return (
    <>
      <Action btnProps confirmProps={{ title: "test" }}>
        detail
      </Action>
      <ActionToForm
        modalTitle="用户表单"
        formProps={{
          onSubmit: ActionOnSubmit,
          itemConfig: [{ type: "input", itemProps: { label: "姓名", name: "user" } }],
        }}
        btnProps={{
          type: "primary",
        }}
      >
        ShowFormModal
      </ActionToForm>
      <Form
        style={{ width: 400 }}
        formProps={formOptions}
        itemConfig={itemOptions}
        title="FormTitle"
        onSubmit={onSubmit}
      />
    </>
  );
}
