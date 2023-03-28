import React, { useEffect, memo } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { useSpring, animated, config } from "react-spring";

function Switch({ isOn, toggle }) {
  const [{ background, x }, set] = useSpring(() => ({
    background: "#141415",
    x: "2px",
    config: config.stiff,
  }));

  useEffect(() => {
    if (isOn) set({ background: "#3682D3", x: "20px" });
    else set({ background: "#141415", x: "0px" });
  }, [isOn]);

  return (
    <Container
      onClick={() => {
        toggle();
      }}
    >
      <Label>{isOn ? `Art Directed` : `Studio`}</Label>
      <SwitchContainer style={{ background }}>
        <Thumb style={{ x }} />
      </SwitchContainer>
    </Container>
  );
}

function arePropsEqual(prevProps, nextProps) {
  return prevProps.isOn === nextProps.isOn;
}

export default memo(Switch, arePropsEqual);

Switch.propTypes = {
  isOn: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
};

const Container = styled.div`
  height: 35px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 10px;
  cursor: pointer;
`;

const Label = styled.span`
  color: #767676;
  font-size: 0.8em;
`;

const SwitchContainer = styled(animated.div)`
  height: 70%;
  width: 45px;
  border-radius: 15px;
`;

const Thumb = styled(animated.div)`
  background: #d9d9d9;
  height: 100%;
  width: 25px;
  border-radius: 15px;
`;
