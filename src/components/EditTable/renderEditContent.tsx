import React from "react";
import { EditValueOption } from "./types";
import { DatePicker, Input, InputNumber, InputProps, Select, Switch } from "antd";

export default function renderEditContent(
  { type, props, value }: EditValueOption,
  commonChange?: (value: any) => any,
) {
  const originPropsOnChange = props.onChange as ((...args: any) => any) | undefined;
  const onChange = async (...args: any[]) => {
    await originPropsOnChange?.(...args);
    if (["string", "textarea"].includes(type)) await commonChange?.(args[0].target.value);
    else await commonChange?.(args[0]);
  };

  if (["string", "textarea"].includes(type)) {
    delete props.onChange;
    (props as InputProps).onBlur = onChange;
  } else {
    props.onChange = onChange;
  }

  switch (type) {
    case "string":
      return <Input {...props} value={undefined} defaultValue={value} />;
    case "number":
      return <InputNumber {...props} value={value} />;
    case "textarea":
      return <Input.TextArea {...props} value={undefined} defaultValue={value} />;
    case "boolean":
      return <Switch {...props} value={value} />;
    case "date":
      return <DatePicker {...props} value={value} />;
    case "dateRange":
      return <DatePicker.RangePicker {...props} value={value} />;
    case "select":
      return <Select {...props} value={value} />;
  }
}
