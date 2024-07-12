import React, { useState } from "react";
import { Button, Layout, Radio, theme } from "antd";
import { LayoutPageStyled } from "./styled";

import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Outlet } from "react-router-dom";
import MenuList from "./components/MenuList";
import Breadcrumb from "./components/Breadcrumb";
import { setTheme, useThemeMode, useToken } from "@/store/theme";
import { store } from "@/store";

const { Header, Sider, Content } = Layout;

export default function LayoutPage() {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const themeMode = useThemeMode();
  const { token: antToken } = theme.useToken();
  const themeToken = useToken();

  return (
    <LayoutPageStyled antToken={antToken} token={themeToken} mode={themeMode}>
      <Layout className="layout">
        <Sider className="layout-sider-bar" collapsed={collapsed}>
          <div className="logo whitespace-nowrap">{collapsed ? "V" : "Vite - React"}</div>
          <MenuList />
        </Sider>

        <Layout>
          <Header className="layout-header p-0 flex items-center justify-between">
            <div className="flex items-center">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className="text-base w-16 h-16"
              />
              <Breadcrumb />
            </div>

            <div className="pr-6">
              <Radio.Group
                value={themeMode}
                optionType="button"
                buttonStyle="solid"
                options={[
                  { label: "明亮", value: "light" },
                  { label: "暗黑", value: "dark" },
                ]}
                onChange={e => store.dispatch(setTheme({ mode: e.target.value }))}
              />
            </div>
          </Header>

          <Layout className="h-full overflow-auto flex flex-col layout-content">
            <Content>
              <Outlet />
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </LayoutPageStyled>
  );
}
