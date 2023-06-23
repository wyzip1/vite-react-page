import styled from "styled-components";

export const TagViewsStyled = styled.div<{
  primary: string;
}>`
  width: 100%;
  margin: 10px 16px;
  box-sizing: border-box;

  display: flex;
  align-items: center;
  column-gap: 10px;

  padding-left: 3px;

  & .tag-item {
    font-size: 12px;
    padding: 0 15px;
    cursor: pointer;

    height: 24px;

    text-align: center;
    line-height: 24px;
    background-color: #fff;
    transition: 0.3s;
    box-shadow: 2px 2px 6px #bebebe, -2px -2px 6px #ffffff;
    border-radius: 5px;

    animation: tagAnimation 0.3s forwards ease-in-out;

    &.active {
      background-color: ${props => props.primary};
      color: #fff;
    }
  }

  @keyframes tagAnimation {
    from {
      transform: translateY(5px);
      opacity: 0.3;
    }
    to {
      transform: translate(0);
      opacity: 1;
    }
  }
`;
