import { Button, Form } from "antd";
import { useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import SearchField from "./SearchField";
import { SearchForm } from "./styles";
import { createInitialValues, toCssLength } from "./utils";
import type { SearchProps, SearchValues } from "./types";

export default function Search({
  ref,
  config,
  labelWidth = 60,
  minItemWidth = 220,
  maxItemsPerRow = 4,
  loading,
  onChange,
  onSearch,
  onReset,
  searchBtnExtend,
  actionClassName,
  actionStyle,
  autoWrap = true,
}: SearchProps) {
  const [form] = Form.useForm();
  const [lastAction, setLastAction] = useState<"search" | "reset">("search");
  const initialValues = useMemo(() => createInitialValues(config), [config]);
  const columnCount = Math.max(1, Math.floor(maxItemsPerRow));
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useImperativeHandle(
    ref,
    () => ({
      getFormData: () => form.getFieldsValue(true),
      resetFormData: () => {
        form.resetFields();
        onChangeRef.current?.(initialValues);
      },
    }),
    [form, initialValues],
  );

  useEffect(() => {
    form.setFieldsValue(initialValues);
    onChangeRef.current?.(initialValues);
  }, [form, initialValues]);

  const search = () => {
    if (loading) return;
    setLastAction("search");
    onSearch(form.getFieldsValue(true));
  };

  const reset = () => {
    if (loading) return;
    setLastAction("reset");
    form.resetFields();
    onChange?.(initialValues);
    onReset?.(initialValues);
  };

  return (
    <SearchForm
      form={form}
      layout="inline"
      colon={false}
      initialValues={initialValues}
      labelCol={{ flex: toCssLength(labelWidth) }}
      wrapperCol={{ flex: "1 1 0", style: { minWidth: toCssLength(minItemWidth) } }}
      $maxItemsPerRow={columnCount}
      $autoWrap={autoWrap}
      onFinish={search}
      onValuesChange={(_, values) => onChange?.(values as SearchValues)}
    >
      {config.map(option => (
        <SearchField option={option} onSearch={search} key={option.key} />
      ))}
      <div className={`search-actions ${actionClassName ?? ""}`} style={actionStyle}>
        <Button htmlType="submit" type="primary" loading={lastAction === "search" && loading}>
          查询
        </Button>
        <Button type="default" loading={lastAction === "reset" && loading} onClick={reset}>
          重置
        </Button>
        {searchBtnExtend}
      </div>
    </SearchForm>
  );
}
