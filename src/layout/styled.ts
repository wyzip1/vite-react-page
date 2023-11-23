import styled from "styled-components";

export const LayoutPageStyled = styled.div`
  height: 100vh;
  max-height: 100vh;

  & > .layout {
    height: 100%;

    & .layout-content {
      overflow: auto;
      height: 100%;
      margin: 16px;
      padding: 20px 16px;
      box-sizing: border-box;
      background-color: #fff;
    }

    & .sider-bar {
      height: 100%;
      overflow: auto;

      & .logo {
        height: 32px;
        margin: 16px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 6px;
      }
    }
  }
`;
