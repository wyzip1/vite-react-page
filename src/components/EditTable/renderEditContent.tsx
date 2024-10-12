import React from "react";
import { EditValueOption } from "./types";
import { DatePicker, Input, InputNumber, Select, Switch } from "antd";
import dayjs from "dayjs";

export function formatToDayjs(v: any) {
  if (["", null, undefined].includes(v)) return v;
  if (dayjs.isDayjs(v)) return v;

  return dayjs(v);
}

export default function renderEditContent({ type, props }: EditValueOption) {
  switch (type) {
    case "string":
      return <Input {...props} />;
    case "number":
      return <InputNumber {...props} />;
    case "textarea":
      return <Input.TextArea {...props} />;
    case "boolean":
      return <Switch {...props} />;
    case "date":
      return <DatePicker {...props} />;
    case "dateRange":
      return <DatePicker.RangePicker {...props} />;
    case "select":
      return <Select {...props} />;
  }
}
