import { useToken } from "@/store/theme";
import { GlobalToken } from "antd";
import styled from "styled-components";

export interface ThemeStyledProps {
  mode?: string;
  token?: ReturnType<typeof useToken>;
  antToken?: GlobalToken;
}

const MainStyled = styled.div<ThemeStyledProps>``;

export default MainStyled;
