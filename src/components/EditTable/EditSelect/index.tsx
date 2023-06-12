import { Select, SelectProps } from "antd";
import React from "react";

type EditSelectValue = string | number | undefined;

interface EditSelectProps {
  value: EditSelectValue;
  updateValue: EditSelectValue;
  edit?: boolean;
  props?: SelectProps;
  onChange?(value: EditSelectValue): void;
  defaultValue?: { label: string; value: string | number };
}

const EditSelect: React.FC<EditSelectProps> = ({
  value,
  updateValue,
  edit,
  onChange,
  props,
  defaultValue,
}) => {
  if (!edit) return <>{value}</>;
  if (Array.isArray(props?.options) && defaultValue) {
    const exists = props?.options.some(item => item.value === defaultValue.value);
    if (!exists) props?.options.push(defaultValue);
  }
  return (
    <Select style={{ width: "100%" }} value={updateValue} onChange={onChange} {...props} />
  );
};

export default EditSelect;
