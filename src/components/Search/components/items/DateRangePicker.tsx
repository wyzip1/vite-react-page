import React from "react";
import { DatePicker } from "antd";

import dayjs, { Dayjs } from "dayjs";

import type { ChangeState } from "../../type";
import type { RangePickerProps } from "antd/es/date-picker/generatePicker";

type EventValue<DataType> = DataType | null;
export type RangeValue<DataType> = [EventValue<DataType>, EventValue<DataType>] | null;

interface CreateDateRangePickerProps {
  width: string;
  value: RangeValue<string>;
  onChange: ChangeState;
  props?: RangePickerProps<Dayjs>;
}

const coverDate = (data: RangeValue<string>): RangeValue<Dayjs> => {
  if (!data) return data;
  const [start, end] = data;
  const format = (str: string | null) => (!str ? null : dayjs(str));
  return [format(start), format(end)];
};

export default function createDateRangePicker(config: CreateDateRangePickerProps) {
  return (
    <DatePicker.RangePicker
      value={coverDate(config.value)}
      style={{ width: config.width }}
      {...config.props}
      onChange={(_, date) => config.onChange(date)}
    />
  );
}
