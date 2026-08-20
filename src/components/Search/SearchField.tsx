import { Form } from "antd";
import SearchControl from "./controls";
import { toCssLength } from "./utils";
import type { SearchOption } from "./types";

interface SearchFieldProps {
  option: SearchOption;
  defaultLabelWidth: number | string;
  defaultInputWidth: number | string;
  onSearch(): void;
}

interface FormControlProps {
  option: SearchOption;
  onSearch(): void;
  value?: unknown;
  onChange?(value: unknown): void;
}

function FormControl({ option, onSearch, value, onChange }: FormControlProps) {
  return <SearchControl option={option} value={value} onChange={onChange} onSearch={onSearch} />;
}

export default function SearchField({
  option,
  defaultLabelWidth,
  defaultInputWidth,
  onSearch,
}: SearchFieldProps) {
  const labelWidth = toCssLength(option.labelWidth ?? defaultLabelWidth)!;
  const inputWidth = toCssLength(option.inputWidth ?? defaultInputWidth)!;

  return (
    <Form.Item
      className="search-item"
      name={option.key}
      label={option.label}
      style={{ width: `calc(${labelWidth} + ${inputWidth})` }}
      labelCol={{ flex: `0 0 ${labelWidth}` }}
      wrapperCol={{ flex: `0 0 ${inputWidth}`, style: { width: inputWidth } }}
    >
      <FormControl option={option} onSearch={onSearch} />
    </Form.Item>
  );
}
