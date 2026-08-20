import { Form } from "antd";
import SearchControl from "./controls";
import { toCssLength } from "./utils";
import type { SearchOption } from "./types";

interface SearchFieldProps {
  option: SearchOption;
  onSearch(): void;
}

interface FormControlProps extends SearchFieldProps {
  value?: unknown;
  onChange?(value: unknown): void;
}

function FormControl({ option, onSearch, value, onChange }: FormControlProps) {
  return <SearchControl option={option} value={value} onChange={onChange} onSearch={onSearch} />;
}

export default function SearchField({ option, onSearch }: SearchFieldProps) {
  const labelCol =
    option.labelWidth !== undefined ? { flex: toCssLength(option.labelWidth) } : undefined;
  const wrapperCol =
    option.minWidth !== undefined
      ? { flex: "1 1 0", style: { minWidth: toCssLength(option.minWidth) } }
      : undefined;

  return (
    <Form.Item
      className="search-item"
      name={option.key}
      label={option.label}
      labelCol={labelCol}
      wrapperCol={wrapperCol}
    >
      <FormControl option={option} onSearch={onSearch} />
    </Form.Item>
  );
}
