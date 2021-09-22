import styled from "styled-components";

const TooltipContainer = styled.div`
  background-color: white;
  padding: 0.5rem;
  border: 1px solid black;
  text-align: left;
  pointer-events: none;
`;
export function Tooltip({x, y, width, height, children, canvasWidth, margin}) {
  let alignLeft = false;
  if (canvasWidth - width + margin.right < x) {
    alignLeft = true;
  }
  return (
    <foreignObject
      x={alignLeft ? x - width : x}
      y={y}
      width={width}
      height={height}
    >
      <TooltipContainer className="tooltip">{children}</TooltipContainer>
    </foreignObject>
  );
}
