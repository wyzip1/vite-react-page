import { DatePicker, DatePickerProps } from "antd";

import dayjs from "dayjs";

import type { ChangeState } from "../../type";
import { RangePickerProps } from "antd/es/date-picker";

type EventValue<DataType> = DataType | null;
export type RangeValue<DataType> = [EventValue<DataType>, EventValue<DataType>] | null;

type GetDatePickerValue<T> = T extends "dateRange"
  ? RangeValue<string>
  : T extends "date"
    ? string
    : never;

type GetDatePickerProps<T> = T extends "dateRange"
  ? RangePickerProps
  : T extends "date"
    ? DatePickerProps
    : never;

interface CreateDatePickerProps<T extends "date" | "dateRange"> {
  width: string;
  value: GetDatePickerValue<T>;
  onChange: ChangeState;
  props?: GetDatePickerProps<T>;
  type?: T;
}

const format = (str?: string | null) => (!str ? null : dayjs(str));

const RenderDatePicker = (props: CreateDatePickerProps<"date">) => {
  return (
    <DatePicker
      value={format(props.value as string)}
      style={{ width: props.width }}
      {...props.props}
      onChange={(_, date) => props.onChange(date)}
    />
  );
};

const RenderRangePicker = (props: CreateDatePickerProps<"dateRange">) => {
  const [start, end] = props.value || [];
  return (
    <DatePicker.RangePicker
      value={[format(start), format(end)]}
      style={{ width: props.width }}
      {...(props.props as RangePickerProps)}
      onChange={(_, date) => props.onChange(date)}
    />
  );
};

export default function createDatePicker<T extends "date" | "dateRange">(
  config: CreateDatePickerProps<T>,
) {
  if (!config.type || config.type === "date")
    return <RenderDatePicker {...(config as CreateDatePickerProps<"date">)} />;
  else if (config.type === "dateRange")
    return <RenderRangePicker {...(config as CreateDatePickerProps<"dateRange">)} />;

  return <></>;
}
