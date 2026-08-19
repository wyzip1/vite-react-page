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

type SearchItemStyle = React.CSSProperties & {
  "--search-item-min-width"?: string;
  "--search-label-width"?: string;
};

function FormControl({ option, onSearch, value, onChange }: FormControlProps) {
  return <SearchControl option={option} value={value} onChange={onChange} onSearch={onSearch} />;
}

export default function SearchField({ option, onSearch }: SearchFieldProps) {
  const style: SearchItemStyle = {
    "--search-item-min-width": toCssLength(option.minWidth),
    "--search-label-width": toCssLength(option.labelWidth),
  };

  return (
    <Form.Item className="search-item" name={option.key} label={option.label} style={style}>
      <FormControl option={option} onSearch={onSearch} />
    </Form.Item>
  );
}
