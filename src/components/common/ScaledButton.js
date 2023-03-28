import React, { useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { animated, useSpring } from "react-spring";
import rightArrow from "./assets/icons/iconArrowNext.svg";
import leftArrow from "./assets/icons/iconArrowBack.svg";

export default function ScaledButton({
  label,
  action,
  color = "#4AAEEB",
  disabled = false,
  iconType = "",
  type = "submit",
}) {
  const [{ background, scale }, set] = useSpring(() => ({
    background: disabled ? "#9a9a9a" : color,
    scale: 1,
    config: { mass: 1, tension: 300, friction: 20 },
  }));

  useEffect(() => {
    disabled ? set({ background: "#9a9a9a" }) : set({ background: color });
  }, [disabled]);

  function getIcon(type) {
    if (type === "next") return rightArrow;
    else return leftArrow;
  }

  return (
    <Button
      type={type}
      onMouseEnter={() => {
        if (!disabled) set({ background: "#1D83C2", scale: 1.05 });
      }}
      onMouseLeave={() => {
        if (!disabled) set({ background: color, scale: 1 });
      }}
      onClick={action}
      style={{ background, scale }}
      background={color}
      disabled={disabled}
      cursor={disabled ? `not-allowed` : `pointer`}
    >
      {iconType != "" && iconType === "back" && <Icon src={getIcon(iconType)} />}
      <Label>{label}</Label>
      {iconType != "" && iconType === "next" && !disabled && <Icon src={getIcon(iconType)} />}
    </Button>
  );
}

ScaledButton.propTypes = {
  label: PropTypes.string.isRequired,
  action: PropTypes.func.isRequired,
  color: PropTypes.string,
  disabled: PropTypes.bool,
  iconType: PropTypes.string,
  type: PropTypes.string,
};

const Button = styled(animated.button)`
  height: 50px;
  width: 150px;
  border: none;
  border-radius: 25px;
  color: white;
  font-size: 0.9em;
  cursor: ${(props) => props.cursor};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Icon = styled.img`
  margin: 0 5px;
  width: 15px;
  height: 15px;
`;

const Label = styled.span`
  font-size: 1.2em;
  padding-top: 3.5px;
  color: white;
  font-family: "Overpass-Medium";
`;
