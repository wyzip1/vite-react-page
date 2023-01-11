import React, { useRef, useState } from "react";
import styled from "styled-components";

const ResizeAreaStyled = styled.div<{ translateX: number }>`
  width: 100%;
  display: flex;
  height: calc(100vh - 70px);
  position: relative;
  --translate-x: ${props => props.translateX + "px"};
  .move-area {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 10;
    cursor: col-resize;
  }

  .left-area,
  .right-area {
    width: calc(50% - 2px - var(--translate-x));
    height: 100%;

    &.right-area {
      width: calc(50% - 2px + var(--translate-x));
    }
  }

  .line {
    width: 4px;
    height: 100%;
    background-color: #9c27b0;
    filter: brightness(60%);
    cursor: col-resize;

    &:hover,
    &.active {
      filter: brightness(100%);
    }
  }
`;

interface ResizeAreaProps {
  areaA?: React.ReactNode;
  areaB?: React.ReactNode;
}

export default function ResizeArea({ areaA, areaB }: ResizeAreaProps) {
  const [enableResize, setEnableResize] = useState<boolean>(false);
  const [translate, setTranslate] = useState<number>(0);
  const startX = useRef<number>(0);
  const catchTranslate = useRef<number>(0);

  function startResize(ev: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    startX.current = ev.clientX;
    catchTranslate.current = translate;
    setEnableResize(true);
  }

  function resize(ev: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    setTranslate(catchTranslate.current + startX.current - ev.clientX);
  }

  function endResize() {
    startX.current = 0;
    catchTranslate.current = translate;
    setEnableResize(false);
  }

  return (
    <ResizeAreaStyled translateX={translate}>
      {enableResize && (
        <div className="move-area" onMouseMove={resize} onMouseUp={endResize}></div>
      )}
      <div className="left-area">{areaA}</div>
      <div className={`line${enableResize ? " active" : ""}`} onMouseDown={startResize}></div>
      <div className="right-area">{areaB}</div>
    </ResizeAreaStyled>
  );
}
