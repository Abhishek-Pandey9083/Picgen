import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { useSpring, animated, config } from "react-spring";
import styled from "styled-components";
import ReactTooltip from "react-tooltip";
import check from "./assets/icons/check.svg";
import checkBlack from "./assets/icons/check_black.svg";

function GroupCheckBox({
  isSelected,
  onChange,
  name,
  group,
  label,
  hoverText,
  multipleSelection,
  bgColor = "#000",
  bgOnActive = "#000",
  borderColor = "#fff",
  darkCheck = false,
  disableMargin = false,
  passivleyActivated = false,
}) {
  const [{ opacity }, set] = useSpring(() => ({
    opacity: 0,
    config: config.stiff,
  }));

  const selectedRef = useRef(isSelected);

  useEffect(() => {
    document.getElementById(name).addEventListener("keydown", handleCheckBoxEvent, true);
  }, []);

  useEffect(() => {
    if (isSelected) {
      set({ opacity: 1 });
    } else {
      set({ opacity: 0 });
    }
  }, [isSelected]);

  function handleCheckBoxEvent(e) {
    if (e.keyCode === 32) {
      e.preventDefault();
      onChange(selectedRef.current);
    }
  }

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
        disableMargin={disableMargin}
      >
        <Square id={name} bgColor={isSelected ? bgOnActive : bgColor} borderColor={borderColor}>
          <Checked src={darkCheck ? checkBlack : check} style={{ opacity }} />
        </Square>
        <Label $passivleyActivated={passivleyActivated}>{label}</Label>
      </Container>
    </>
  );
}

export default GroupCheckBox;

GroupCheckBox.propTypes = {
  isSelected: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  group: PropTypes.array.isRequired,
  hoverText: PropTypes.string,
  multipleSelection: PropTypes.bool.isRequired,
  bgColor: PropTypes.string,
  bgOnActive: PropTypes.string,
  borderColor: PropTypes.string,
  darkCheck: PropTypes.bool,
  disableMargin: PropTypes.bool,
  passivleyActivated: PropTypes.bool,
};

const Container = styled.div`
  display: block;
  width: fit-content;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin: ${(props) => (props.disableMargin ? 0 : "20px")} 0;
  color: #fff;
  font-size: 0.95em;
  font-family: "Overpass-Medium";
`;

const Square = styled.div`
  flex: 0 0 auto;
  width: 18px;
  height: 18px;
  background-color: ${(props) => props.bgColor};
  border: 1px solid ${(props) => props.borderColor};
  border-radius: 20%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
`;

const Label = styled.div`
  padding-top: 1px;
  color: ${(props) => (props.$passivleyActivated ? "gray" : "#fff")};
`;

const Checked = styled(animated.img)`
  width: 70%;
  height: 70%;
`;

const TooltipContainer = styled.div`
  width: 170px;
`;
