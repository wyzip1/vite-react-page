import type { useToken } from "@/store/theme";
import type { GlobalToken } from "antd";
import styled from "styled-components";

export interface ThemeStyledProps {
  mode?: string;
  token?: ReturnType<typeof useToken>;
  antToken?: GlobalToken;
}

const MainStyled = styled.div<ThemeStyledProps>`
  .ant-upload button {
    color: ${v => v.antToken?.colorText};
  }
`;

export default MainStyled;
