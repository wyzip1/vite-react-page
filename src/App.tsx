import { ConfigProvider, theme } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import "dayjs/locale/zh-cn";
import MainStyled from "@/styles/MainStyled";
import { StyleProvider } from "@ant-design/cssinjs";

export const AntConfigProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <StyleProvider layer>
      <ConfigProvider
        locale={zhCN}
        theme={{
          algorithm: [theme.defaultAlgorithm],
          token: { colorPrimary: "#155bd4", borderRadius: 0 },
        }}
      >
        {children}
      </ConfigProvider>
    </StyleProvider>
  );
};

export default function App() {
  const { token: antToken } = theme.useToken();

  return (
    <MainStyled $antToken={antToken} style={{ width: "100%", height: "100vh" }}>
      <Outlet />
    </MainStyled>
  );
}
