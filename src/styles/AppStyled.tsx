import styled from "styled-components";
import { useToken } from "@/store/theme";
import { theme } from "antd";
import { ThemeStyledProps } from "./MainStyled";
export const AppStyledComponent = styled.div<ThemeStyledProps>`
  width: 100%;
  height: 100%;
  padding: 20px 16px;
  box-sizing: border-box;
  background-color: ${v => v.antToken?.colorBgContainer};
  color: ${v => v.antToken?.colorText};

  animation: fadeIn 0.3s ease-in-out forwards;
`;

const AppStyled: React.FC<{
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
}> = ({ style, ...props }) => {
  const themeToken = useToken();
  const { token } = theme.useToken();

  return (
    <AppStyledComponent token={themeToken} antToken={token} style={{ ...style }} {...props} />
  );
};

export default AppStyled;
