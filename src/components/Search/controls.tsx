import { Cascader, DatePicker, Input, Select } from "antd";
import dayjs from "dayjs";
import { toCssLength } from "./utils";
import type {
  CascaderOption,
  DateOption,
  DateRangeOption,
  InputOption,
  SearchOption,
  SelectOption,
} from "./types";

const CascaderControl = Cascader as React.ComponentType<any>;

interface SearchControlProps {
  option: SearchOption;
  value?: unknown;
  onChange?(value: unknown): void;
  onSearch(): void;
}

const toDayjs = (value?: string | null) => (value ? dayjs(value) : null);

export default function SearchControl({ option, value, onChange, onSearch }: SearchControlProps) {
  if (option.component) {
    return option.component(
      value => onChange?.(value),
      value === undefined ? option.defaultValue : value,
      onSearch,
    );
  }

  const width = toCssLength(option.width) ?? "100%";

  switch (option.type ?? "input") {
    case "select": {
      const props = (option as SelectOption).props;
      return (
        <Select
          {...props}
          value={value}
          style={{ width, ...props?.style }}
          onChange={value => onChange?.(value)}
        />
      );
    }
    case "cascader": {
      const props = (option as CascaderOption).props;
      return (
        <CascaderControl
          {...props}
          value={value as any}
          style={{ width, ...props?.style }}
          onChange={value => onChange?.(value)}
        />
      );
    }
    case "date": {
      const props = (option as DateOption).props;
      return (
        <DatePicker
          {...props}
          value={toDayjs(value as string)}
          style={{ width, ...props?.style }}
          onChange={(_, date) => onChange?.(date)}
        />
      );
    }
    case "dateRange": {
      const props = (option as DateRangeOption).props;
      const [start, end] = (value as [string | null, string | null] | null) ?? [];
      return (
        <DatePicker.RangePicker
          {...props}
          value={[toDayjs(start), toDayjs(end)]}
          style={{ width, ...props?.style }}
          onChange={(_, date) => onChange?.(date)}
        />
      );
    }
    default: {
      const props = (option as InputOption).props;
      return (
        <Input
          {...props}
          value={(value ?? "") as string}
          style={{ width, ...props?.style }}
          onChange={event => onChange?.(event.target.value)}
          onKeyDown={event => {
            props?.onKeyDown?.(event);
            if (event.code !== "Enter" || event.defaultPrevented) return;
            event.preventDefault();
            onSearch();
          }}
        />
      );
    }
  }
}
