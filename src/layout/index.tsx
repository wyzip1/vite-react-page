import React from "react";
import { Layout } from "antd";
import { LayoutPageStyled } from "./styled";
import MenuList from "./components/MenuList";
import routerList from "src/router";

import type { ReactNode } from "react";

interface LayoutProps {
  children?: ReactNode;
}

const LayoutRouterList = routerList.find(router => router.name === "Layout")?.children || [];
const { Header, Sider, Content } = Layout;

export default function LayoutPage(props: LayoutProps) {
  return (
    <LayoutPageStyled>
      <Layout className="layout">
        <Sider theme="dark" className="sider-bar">
          <MenuList routerList={LayoutRouterList} />
        </Sider>
        <Layout>
          <Header>Header</Header>
          <div style={{ height: "100%", overflow: "auto" }}>
            <Content className="layout-content">{props.children}</Content>
          </div>
        </Layout>
      </Layout>
    </LayoutPageStyled>
  );
}
