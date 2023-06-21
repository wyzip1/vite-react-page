import React, { useState } from "react";
import { Button, Layout, theme } from "antd";
import { LayoutPageStyled } from "./styled";
import MenuList from "./components/MenuList";
import routerList from "@/router";
import BreadcrumbMenuList from "./components/BreadcrumbMenuList";

import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Outlet } from "react-router-dom";

interface LayoutProps {}

const LayoutRouterList = routerList.find(router => router.name === "Layout")?.children || [];
const { Header, Sider, Content } = Layout;

export default function LayoutPage(props: LayoutProps) {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <LayoutPageStyled>
      <Layout className="layout">
        <Sider theme="dark" className="sider-bar" collapsed={collapsed}>
          <div className="logo"></div>
          <MenuList routerList={LayoutRouterList} />
        </Sider>
        <Layout>
          <Header
            style={{
              padding: 0,
              background: colorBgContainer,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
              }}
            />
            <BreadcrumbMenuList routerList={routerList} />
          </Header>
          <div style={{ height: "100%", overflow: "auto" }}>
            <Content className="layout-content">
              <Outlet />
            </Content>
          </div>
        </Layout>
      </Layout>
    </LayoutPageStyled>
  );
}
