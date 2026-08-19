import styled from "styled-components";
import { theme } from "antd";
import type { ThemeStyledProps } from "./MainStyled";
export const AppStyledComponent = styled.div<ThemeStyledProps>`
  width: 100%;
  height: 100%;
  padding: 20px 16px;
  box-sizing: border-box;
  background-color: ${v => v.$antToken?.colorBgContainer};
  color: ${v => v.$antToken?.colorText};
  overflow: auto;

  animation: fadeIn 0.3s ease-in-out forwards;
`;

const AppStyled: React.FC<{
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
}> = ({ style, ...props }) => {
  const { token } = theme.useToken();

  return <AppStyledComponent $antToken={token} style={{ ...style }} {...props} />;
};

export default AppStyled;
