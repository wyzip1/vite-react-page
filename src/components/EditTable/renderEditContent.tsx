import { sleep } from "@/utils";
import { EditValueOption } from "./types";
import { DatePicker, Input, InputNumber, InputProps, Select, Switch } from "antd";
import dayjs from "dayjs";

export function formatToDayjs(v: any) {
  if (["", null, undefined].includes(v)) return v;
  if (dayjs.isDayjs(v)) return v;

  return dayjs(v);
}

export const INPUT_EDIT = ["number", "string", "textarea"];

export default function renderEditContent(
  { type, props, value }: EditValueOption,
  commonChange?: (value: any) => any,
) {
  let editValue = value;
  const originPropsOnChange = props.onChange as ((...args: any) => any) | undefined;
  const onChange = async (...args: any[]) => {
    await sleep(20);
    await originPropsOnChange?.(...args);

    if (INPUT_EDIT.includes(type)) await commonChange?.(editValue);
    else await commonChange?.(args[0]);
  };

  if (INPUT_EDIT.includes(type)) {
    delete props.onChange;
    (props as InputProps).onBlur = onChange;
  } else {
    props.onChange = onChange;
  }

  switch (type) {
    case "string":
      return (
        <Input
          {...props}
          onChange={e => (editValue = e.target.value)}
          value={undefined}
          defaultValue={value}
        />
      );
    case "number":
      return <InputNumber {...props} onChange={v => (editValue = v)} value={value} />;
    case "textarea":
      return (
        <Input.TextArea
          {...props}
          onChange={e => (editValue = e.target.value)}
          value={undefined}
          defaultValue={value}
        />
      );
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
