import { useToken } from "@/store/theme";
import { GlobalToken } from "antd";
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
