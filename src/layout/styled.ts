import { ThemeStyledProps } from "@/styles/MainStyled";
import styled from "styled-components";

export const LayoutPageStyled = styled.div<ThemeStyledProps>`
  height: 100vh;
  max-height: 100vh;
  background-image: linear-gradient(
    ${v => v.antToken?.colorBgContainer},
    ${v => v.antToken?.colorBgBase} 28%
  );

  & * {
    scrollbar-color: ${v => v.antToken?.colorTextPlaceholder} ${v => v.antToken?.colorSplit};
  }

  & .layout-header {
    background-color: ${v => v.token?.headerBg};
    border-block-end: 1px solid ${v => v.antToken?.colorSplit};
  }

  & .layout-sider-bar {
    height: 100%;
    overflow: auto;
    background-color: ${v => (v.mode === "dark" ? v.token?.headerBg : "")};
    border-right: 1px solid ${v => v.antToken?.colorSplit};

    & .logo {
      height: 32px;
      margin: 16px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  & > .layout {
    height: 100%;

    & .layout-content {
      margin: 16px;
    }
  }
`;
