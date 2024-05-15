import React from "react";
import { EditValueOption } from "./types";
import { DatePicker, Input, InputNumber, Select, Switch } from "antd";

export default function renderEditContent(
  { type, props, value }: EditValueOption,
  commonChange?: (value: any) => any
) {
  const originPropsOnChange = props.onChange as ((...args: any) => any) | undefined;
  const onChange = async (...args: any[]) => {
    await originPropsOnChange?.(...args);
    if (type === "string") await commonChange?.(args[0].target.value);
    else await commonChange?.(args[0]);
  };
  props.onChange = onChange;

  switch (type) {
    case "string":
      return <Input {...props} value={value} />;
    case "number":
      return <InputNumber {...props} value={value} />;
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
