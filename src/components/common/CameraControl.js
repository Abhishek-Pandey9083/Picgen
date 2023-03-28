import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { animated, useSpring } from "react-spring";

export default function CameraControl({ icon, action, color }) {
  const [{ scale }, set] = useSpring(() => ({
    scale: 1,
    config: { mass: 1, tension: 300, friction: 20 },
  }));

  const WHITE = `invert(100%) sepia(0%) saturate(745%) hue-rotate(353deg) brightness(109%) contrast(101%)`;
  const arrowColor = color === "white" ? WHITE : ``;

  return (
    <Container
      onMouseEnter={() => set({ scale: 1.2 })}
      onMouseLeave={() => set({ scale: 1 })}
      onClick={action}
      style={{ scale }}
    >
      <Icon src={icon} color={arrowColor} />
    </Container>
  );
}

CameraControl.propTypes = {
  icon: PropTypes.string.isRequired,
  action: PropTypes.func.isRequired,
  color: PropTypes.string.isRequired,
};

const Container = styled(animated.div)`
  cursor: pointer;
  height: 30px;
  width: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Icon = styled.img`
  height: 21px;
  width: 12px;
  filter: ${(props) => props.color};
`;
