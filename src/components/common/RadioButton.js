import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useSpring, animated, config } from "react-spring";
import styled from "styled-components";
import ReactTooltip from "react-tooltip";

function RadioButton({
  value,
  label,
  hoverText,
  secondaryLabel,
  onChange,
  selectedValue,
  passivleyActivated = false,
}) {
  const [{ opacity }, set] = useSpring(() => ({
    opacity: 0,
    config: config.stiff,
  }));

  const selectedRef = useRef(selectedValue);

  useEffect(() => {
    document.getElementById(value).addEventListener("keydown", handleRadioButtonEvent, true);
  }, []);

  function handleRadioButtonEvent(e) {
    if (e.keyCode === 32) {
      e.preventDefault();
      onChange(selectedRef.current);
    }
  }

  useEffect(() => {
    selectedRef.current = value;
    if (selectedValue === value) {
      set({ opacity: 1 });
      document.getElementById(value).focus();
    } else {
      set({ opacity: 0 });
    }
  }, [selectedValue]);

  return (
    <>
      {hoverText && (
        <ReactTooltip
          id={label}
          place="bottom"
          backgroundColor="#222"
          delayShow={100}
          multiline={true}
          html={true}
        >
          {hoverText}
        </ReactTooltip>
      )}

      <Container data-tip data-for={label} onClick={() => onChange(value)}>
        <Circle id={value}>
          <Checked style={{ opacity }} />
        </Circle>
        <Label $passivleyActivated={passivleyActivated}>{label}</Label>
        <SecondaryLabel>{secondaryLabel}</SecondaryLabel>
      </Container>
    </>
  );
}

RadioButton.propTypes = {
  selectedValue: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  secondaryLabel: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  hoverText: PropTypes.string,
  passivleyActivated: PropTypes.bool,
};

export default RadioButton;

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
  color: ${(props) => (props.$passivleyActivated ? "gray" : "#fff")};
  font-family: "Overpass-Regular", serif;
  font-size: 15px;
  margin-left: 5px;
  padding-top: 1.5px;
`;

const SecondaryLabel = styled.span`
  color: #8a8a8a;
  font-family: "Overpass-Light", serif;
  font-size: 14px;
  margin-left: 5px;
`;
