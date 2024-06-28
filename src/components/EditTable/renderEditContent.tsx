import React from "react";
import { EditValueOption } from "./types";
import { DatePicker, Input, InputNumber, Select, Switch } from "antd";
import dayjs from "dayjs";

export function formatToDayjs(v: any) {
  if (["", null, undefined].includes(v)) return v;
  if (dayjs.isDayjs(v)) return v;
  return dayjs(v);
}

export default function renderEditContent(
  { type, props, value }: EditValueOption,
  commonChange?: (value: any) => any,
) {
  const onChange = async (...args: any[]) => {
    // @ts-ignore
    props.onChange?.(...args);
    if (["string", "textarea"].includes(type)) await commonChange?.(args[0].target.value);
    else await commonChange?.(args[0]);
  };

  switch (type) {
    case "string":
      return <Input {...props} value={undefined} defaultValue={value} onBlur={onChange} />;
    case "number":
      return <InputNumber {...props} value={value} onChange={onChange} />;
    case "textarea":
      return (
        <Input.TextArea {...props} value={undefined} defaultValue={value} onBlur={onChange} />
      );
    case "boolean":
      return <Switch {...props} value={value} onChange={onChange} />;
    case "date":
      return <DatePicker {...props} value={formatToDayjs(value)} onChange={onChange} />;
    case "dateRange":
      return (
        <DatePicker.RangePicker
          {...props}
          value={value ? [formatToDayjs(value[0]), formatToDayjs(value[1])] : value}
          onChange={onChange}
        />
      );
    case "select":
      return <Select {...props} value={value} onChange={onChange} />;
  }
}
