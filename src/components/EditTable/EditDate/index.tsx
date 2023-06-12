import { DatePickerProps, DatePicker } from "antd";
import React from "react";
import dayjs from "dayjs";

export type EditDateValue = string | undefined;

interface EditDateProps {
  value: EditDateValue;
  updateValue: EditDateValue;
  edit?: boolean;
  props?: DatePickerProps;
  onChange?(value: EditDateValue): void;
}

const EditDate: React.FC<EditDateProps> = ({ value, updateValue, edit, onChange, props }) => {
  if (!edit) return <>{value}</>;

  return (
    <DatePicker
      value={updateValue ? dayjs(updateValue) : undefined}
      onChange={value => onChange?.(dayjs(value).format("YYYY-MM-DD"))}
      {...props}
    />
  );
};

export default EditDate;
