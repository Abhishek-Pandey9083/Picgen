import React, { memo } from "react";
import PropTypes from "prop-types";
import { useSpring, animated, config } from "react-spring";
import styled from "styled-components";
import ReactTooltip from "react-tooltip";

function ActionTab({
  icon,
  name,
  isOn,
  size = "65px",
  toggleIsOn,
  hoverIcon = "",
  primaryLabel = "",
  secondaryLabel = "",
  secondaryIcon = "",
}) {
  const [{ sizeCircle, scaleIcon }, set] = useSpring(() => ({
    sizeCircle: "0%",
    scaleIcon: 1,
    opacity: 0,
    config: config.stiff,
  }));

  return (
    <Container>
      <ReactTooltip id={name} type="dark" place="top" effect="solid" delayShow={50}>
        <TooltipContainer>
          {primaryLabel && secondaryLabel
            ? isOn
              ? primaryLabel
              : secondaryLabel
            : `${name} ${isOn ? "enabled" : "disabled"}`}
        </TooltipContainer>
      </ReactTooltip>

      <TabContainer
        data-tip
        data-for={name}
        onMouseEnter={() => {
          set({ sizeCircle: "90%", scaleIcon: 0.85, opacity: 1 });
        }}
        size={size}
        onMouseLeave={() => {
          set({
            sizeCircle: "0%",
            scaleIcon: 1,
            opacity: 0,
          });
        }}
        onClick={() => toggleIsOn()}
        id={name}
      >
        <Circle style={{ height: sizeCircle, width: sizeCircle }}>
          {hoverIcon != "" && <HoverIcon src={hoverIcon} />}
        </Circle>
        <IconContainer style={{ scale: scaleIcon }}>
          {!secondaryIcon && <Icon src={icon} brightness={isOn ? "100%" : "50%"} />}
          {secondaryIcon && <Icon src={isOn ? icon : secondaryIcon} />}
        </IconContainer>
      </TabContainer>
    </Container>
  );
}

function arePropsEqual(prevProps, nextProps) {
  return prevProps.isOn === nextProps.isOn;
}

export default memo(ActionTab, arePropsEqual);

ActionTab.propTypes = {
  icon: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  isOn: PropTypes.bool.isRequired,
  size: PropTypes.string,
  toggleIsOn: PropTypes.func.isRequired,
  hoverIcon: PropTypes.string,
  primaryLabel: PropTypes.string,
  secondaryLabel: PropTypes.string,
  secondaryIcon: PropTypes.string,
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
`;

const TabContainer = styled.div`
  height: ${(props) => props.size};
  width: ${(props) => props.size};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.6);
  margin: 0 5px;
  border-radius: 35px;
`;

const Circle = styled(animated.div)`
  background-color: black;
  border-radius: 35px;
  position: relative;
`;

const HoverIcon = styled.img`
  width: 100%;
  border-radius: 35px;
  background: black;
  z-index: 3;
  position: absolute;
`;

const IconContainer = styled(animated.div)`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Icon = styled.img`
  width: 30px;
  height: auto;
  filter: brightness(${(props) => props.brightness});
`;

const TooltipContainer = styled.div`
  width: auto;
  text-transform: capitalize;
`;
