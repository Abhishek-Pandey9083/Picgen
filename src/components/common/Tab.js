import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { useSpring, animated, config } from "react-spring";
import styled from "styled-components";
import ReactTooltip from "react-tooltip";

function Tab({ icon, name, selectedCategory, changeCategory, hoverText }) {
  const [{ sizeCircle, scaleIcon }, set] = useSpring(() => ({
    sizeCircle: "0%",
    scaleIcon: 0.8,
    config: config.stiff,
  }));

  useEffect(() => {
    if (selectedCategory === name) set({ sizeCircle: "100%", scaleIcon: 1 });
    else set({ sizeCircle: "0%", scaleIcon: 0.8 });
  }, [selectedCategory]);

  return (
    <>
      {hoverText && (
        <ReactTooltipMod
          id={name}
          type="dark"
          place="left"
          effect="solid"
          delayShow={50}
          offset={{ left: -5 }}
          arrowColor="transparent"
          backgroundColor="#1E2022"
          opacity={1}
        >
          <TooltipContainer>{hoverText}</TooltipContainer>
        </ReactTooltipMod>
      )}
      <Container
        data-tip
        data-for={name}
        onMouseEnter={() => {
          if (selectedCategory != name) set({ sizeCircle: "100%", scaleIcon: 1 });
        }}
        onMouseLeave={() => {
          if (selectedCategory != name)
            set({
              sizeCircle: "0%",
              scaleIcon: 0.8,
            });
        }}
        onClick={() => changeCategory(name)}
        id={name}
      >
        <Circle style={{ height: sizeCircle, width: sizeCircle }} />
        <IconContainer style={{ scale: scaleIcon }}>
          <Icon src={icon} />
        </IconContainer>
      </Container>
    </>
  );
}

export default Tab;

Tab.propTypes = {
  icon: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  selectedCategory: PropTypes.string.isRequired,
  changeCategory: PropTypes.func.isRequired,
  hoverText: PropTypes.string.isRequired,
};

const Container = styled.div`
  height: 54px;
  width: 54px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  position: relative;
`;

const Circle = styled(animated.div)`
  background-color: black;
  border-radius: 50%;
`;

const IconContainer = styled(animated.div)`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
`;

const Icon = styled.img`
  width: 85%;
`;

const ReactTooltipMod = styled(ReactTooltip)`
  opacity: ${(props) => props.opacity || "0.9"} !important;
`;

const TooltipContainer = styled.div`
  width: auto;
  // margin-top: -12px;
  text-transform: capitalize;
`;
