import React, { memo } from "react";
import PropTypes from "prop-types";
import { animated } from "react-spring";
import styled from "styled-components";
import CameraControl from "./CameraControl";
import leftArrow from "./assets/icons/iconArrowLeft.svg";
import rightArrow from "./assets/icons/iconArrowRight.svg";

function CameraControlBar({
  opacity,
  decrementIndex,
  incrementIndex,
  isExteriorOn,
  isBackgroundOn,
}) {
  return (
    <Container style={{ opacity }}>
      <CameraControl
        icon={leftArrow}
        action={decrementIndex}
        color={isExteriorOn && isBackgroundOn ? "black" : "white"}
      />
      <CameraControl
        icon={rightArrow}
        action={incrementIndex}
        color={isExteriorOn && isBackgroundOn ? "black" : "white"}
      />
    </Container>
  );
}

export default memo(CameraControlBar);

CameraControlBar.propTypes = {
  opacity: PropTypes.object.isRequired,
  incrementIndex: PropTypes.func.isRequired,
  decrementIndex: PropTypes.func.isRequired,
  isExteriorOn: PropTypes.bool.isRequired,
  isBackgroundOn: PropTypes.bool.isRequired,
};

const Container = styled(animated.div)`
  width: 99%;
  height: 50px;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
