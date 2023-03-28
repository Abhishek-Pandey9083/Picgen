import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useSpring, animated, config } from "react-spring";
import styled from "styled-components";
import ReactTooltip from "react-tooltip";

function GroupRadioButton({
  isSelected,
  onChange,
  name,
  group,
  label,
  hoverText,
  multipleSelection,
}) {
  const [{ opacity }, set] = useSpring(() => ({
    opacity: 0,
    config: config.stiff,
  }));

  const selectedRef = useRef(isSelected);

  useEffect(() => {
    document.getElementById(name).addEventListener("keydown", handleKeyDown, true);
  }, []);

  function handleKeyDown(e) {
    if (e.keyCode === 32) {
      e.preventDefault();
      onChange(selectedRef.current);
    }
  }

  useEffect(() => {
    if (isSelected) {
      set({ opacity: 1 });
      document.getElementById(name).focus();
    } else {
      set({ opacity: 0 });
    }
  }, [isSelected]);

  return (
    <>
      {hoverText && name && (
        <ReactTooltip id={name} place="bottom" delayShow={350}>
          <TooltipContainer>{hoverText}</TooltipContainer>
        </ReactTooltip>
      )}
      <Container
        data-tip
        data-for={name}
        onClick={() => onChange(!isSelected, group, name, multipleSelection)}
      >
        <Circle id={name}>
          <Checked style={{ opacity }} />
        </Circle>
        <Label>{label}</Label>
      </Container>
    </>
  );
}

GroupRadioButton.propTypes = {
  isSelected: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  group: PropTypes.array.isRequired,
  hoverText: PropTypes.string,
  multipleSelection: PropTypes.bool.isRequired,
};

export default GroupRadioButton;

const Container = styled.div`
  display: block;
  width: fit-content;
  margin: 20px 0;
  cursor: pointer;
  display: flex;
`;

const Circle = styled.div`
  flex: 0 0 auto;
  width: 20px;
  height: 20px;
  background-color: rgb(22, 24, 25);
  border: 1px solid rgb(87, 88, 89);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const Checked = styled(animated.div)`
  background-color: rgb(255, 255, 255);
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;
  position: absolute;
  border-radius: 50%;
  width: 50%;
  height: 50%;
  margin: 0;
`;

const Label = styled.span`
  color: #fff;
  font-family: "Overpass-Regular", serif;
  font-size: 15px;
  margin-left: 5px;
  padding-top: 1.5px;
`;

const TooltipContainer = styled.div`
  width: 170px;
`;
