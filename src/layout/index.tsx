import { Button, Layout, theme } from "antd";
import { LayoutPageStyled } from "./styled";

import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import MenuList from "./components/MenuList";
import Breadcrumb from "./components/Breadcrumb";
import KeepAliveView from "@/router/components/KeepAlive";

const { Header, Sider, Content } = Layout;

export default function LayoutPage() {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const { token: antToken } = theme.useToken();

  return (
    <LayoutPageStyled $antToken={antToken}>
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
          </Header>

          <Layout className="h-full overflow-auto flex flex-col layout-content">
            <Content>
              <KeepAliveView />
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </LayoutPageStyled>
  );
}
