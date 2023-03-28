import React, { useContext } from "react";
import styled from "styled-components";
import { animated, useSpring } from "react-spring";
import { SiteContext } from "../contexts/SiteContext";

export default function LoadingBar() {
  const { loadingBar } = useContext(SiteContext);
  const [loading] = loadingBar;

  const animation = useSpring({
    x: "100%",
    width: "700px",
    from: { x: "-20%", width: "350px" },
    config: { duration: 1500 },
    loop: true,
  });

  return (
    <>
      {loading && (
        <Container>
          <Bar style={{ x: animation.x }}>
            <Line style={{ width: animation.width }} />
          </Bar>
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  width: 100%;
  position: absolute;
  top: 0;
  overflow: hidden;
  z-index: 4;
`;

const Bar = styled(animated.div)`
  width: 100%;
`;

const Line = styled(animated.div)`
  background: white;
  height: 3px;
`;
