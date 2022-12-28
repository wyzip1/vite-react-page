import React from "react";
import { Button } from "antd";
import styled from "styled-components";

interface HeaderProps {
  run(ev: React.MouseEvent<HTMLElement, MouseEvent>): void;
  loading?: boolean;
}

const HeaderStyled = styled.div`
  width: 100%;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  padding: 15px 20px;
  box-sizing: border-box;
  background-color: #1e1e1e;
  border-bottom: 1px solid #fff;
`;

export default function Header({ run, loading }: HeaderProps) {
  return (
    <HeaderStyled>
      <div className="title">kotlin在线运行</div>
      <Button loading={loading} type="primary" onClick={run}>
        运行
      </Button>
    </HeaderStyled>
  );
}
