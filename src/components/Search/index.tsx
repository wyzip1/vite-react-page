/* eslint-disable react/display-name */
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "antd";
import { SearchStyled } from "./styled";
import { covertLength, initComponentList } from "./utils";
import RenderRow from "./components/RenderRow";
import type { Options, SearchProps, State } from "./type";

export default function Search({
  config,
  defaultLabelWidth = 60,
  loading,
  onChange,
  onSearch,
  onReset,
  searchBtnExtend,
}: SearchProps) {
  const [formData, setFormData] = useState<State>({});
  const [isReset, setIsReset] = useState<boolean>(false);

  useEffect(() => {
    onChange?.(formData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  useEffect(() => {
    if (!loading) setIsReset(false);
  }, [loading]);

  const componentList = useMemo<Options[][]>(() => initComponentList(config), [config]);

  const _defaultLabelWidth = useMemo<string>(
    () => covertLength(defaultLabelWidth)!,
    [defaultLabelWidth]
  );

  const reset = () => {
    setIsReset(true);
    setFormData({});
    onReset?.({});
  };

  const search = () => {
    onSearch(formData);
  };

  return (
    <SearchStyled defaultLabelWidth={_defaultLabelWidth}>
      {componentList.map((item, idx) => (
        <RenderRow
          search={search}
          options={item}
          key={idx}
          state={formData}
          setState={setFormData}
        />
      ))}
      <div className="action-control">
        <Button loading={!isReset && loading} type="primary" onClick={search}>
          查询
        </Button>
        <Button loading={isReset && loading} type="default" onClick={reset}>
          重置
        </Button>
        {searchBtnExtend}
      </div>
    </SearchStyled>
  );
}
