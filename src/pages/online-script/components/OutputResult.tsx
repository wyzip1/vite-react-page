import React, { useState } from "react";
import { Button } from "antd";
import HistoryListDialog from "./HistoryListDialog";
import styled from "styled-components";

const OutputResultStyled = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: #1e1e1e;

  & > .title {
    margin: 20px;
    font-size: 24px;
    font-weight: bold;
    line-height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    padding-bottom: 20px;
    border-bottom: 1px solid #fff;
  }

  & > .content {
    width: calc(100% - 40px);
    margin: auto;
    /* background-color: #fafaf4; */
    height: calc(100vh - 190px);
    color: #fff;
    font-size: 16px;
    font-weight: 500;
    white-space: pre-wrap;
    overflow: auto;
  }
`;

interface OutputResultProps {
  result?: string;
  onChangeValue?: (value: string) => void;
}

export default function OutputResult({ result, onChangeValue }: OutputResultProps) {
  const [openHistory, setOpenHistory] = useState<boolean>(false);

  return (
    <OutputResultStyled>
      <div className="title">
        <span>执行结果：</span>
        <Button type="primary" onClick={() => setOpenHistory(true)}>
          执行历史
        </Button>
      </div>
      <div className="content">{result}</div>
      <HistoryListDialog
        selectHistory={onChangeValue}
        open={openHistory}
        onClose={() => setOpenHistory(false)}
      />
    </OutputResultStyled>
  );
}
