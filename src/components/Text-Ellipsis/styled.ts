import styled from "styled-components";

export const TextEllipsisStyled = styled.div<{
  line: number;
  size: string | number;
  width: string | number;
}>`
  --width: ${props => (typeof props.width === "number" ? props.width + "px" : props.width)};
  --font-size: ${props => (typeof props.size === "number" ? props.width + "px" : props.size)};
  --line: ${props => props.line};

  width: var(--width, 100%);
  overflow: hidden;
  font-size: var(--font-size);
  text-overflow: ellipsis;
  word-wrap: break-word;
  display: -webkit-box;
  /* 控制行数 */
  /* 超出两行隐藏 */
  -webkit-line-clamp: var(--line, 1);
  /* 从上到下垂直排列子元素 */
  /* （设置伸缩盒子的子元素排列方式） */
  -webkit-box-orient: vertical;
`;
