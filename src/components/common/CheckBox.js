import React, { useEffect, useRef, memo } from "react";
import PropTypes from "prop-types";
import { useSpring, animated, config } from "react-spring";
import styled from "styled-components";
import check from "./assets/icons/check.svg";

function CheckBox({ label, link, onChange, isSelected, name, tabIndex }) {
  const [{ opacity }, set] = useSpring(() => ({
    opacity: 0,
    config: config.stiff,
  }));

  const selectedRef = useRef(isSelected);

  useEffect(() => {
    document.getElementById(name).addEventListener("keydown", handleCheckBoxEvent, true);
  }, []);

  useEffect(() => {
    selectedRef.current = isSelected;
    if (isSelected) {
      set({ opacity: 1 });
      document.getElementById(name).focus();
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
    <Container>
      <Square tabIndex={tabIndex} id={name} onClick={onChange}>
        <Checked src={check} style={{ opacity }} />
      </Square>
      <Label onClick={onChange}>{label}</Label>
      {link}
    </Container>
  );
}

CheckBox.propTypes = {
  isSelected: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  link: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  tabIndex: PropTypes.number,
};

function arePropsEqual(prevProps, nextProps) {
  return prevProps.isSelected === nextProps.isSelected;
}

export default memo(CheckBox, arePropsEqual);

const Container = styled.div`
  display: block;
  width: fit-content;
  cursor: pointer;
  display: flex;
  margin: ${(props) => (props.disableMargin ? 0 : "20px")} 0;
`;

const Square = styled.div`
  flex: 0 0 auto;
  width: 18px;
  height: 18px;
  border-radius: 20%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => (props.lightBg ? "#fff" : "#161819")};
  border: 1px solid ${(props) => (props.lightBg ? "#000" : "#fff")};
`;

const Label = styled.span`
  color: #fff;
  font-family: "Overpass-Regular", serif;
  font-size: 1em;
  margin-left: 10px;
  margin-right: 5px;
`;

const Checked = styled(animated.img)`
  width: 70%;
  height: 70%;
`;
