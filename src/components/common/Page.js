import React, { useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { useSpring, animated, config } from "react-spring";

export default function Page({ selectedPage, changeSelectedPage, value, type }) {
  const [{ background }, set] = useSpring(() => ({
    background: "#CCCDCE",
    config: config.stiff,
  }));

  const isSelected = selectedPage.code === value && selectedPage.type === type;

  useEffect(() => {
    if (isSelected) set({ background: "#4AAEEB" });
    else set({ background: "#CCCDCE" });
  }, [selectedPage]);

  return (
    <Container
      onMouseEnter={() => {
        if (!isSelected) set({ background: "#000000" });
      }}
      onMouseLeave={() => {
        if (!isSelected) set({ background: "#CCCDCE" });
      }}
      style={{ background }}
      onClick={() => {
        changeSelectedPage(type, value);
      }}
    />
  );
}

Page.propTypes = {
  selectedPage: PropTypes.object.isRequired,
  changeSelectedPage: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

const Container = styled(animated.div)`
  height: 6px;
  width: 6px;
  border-radius: 25px;
  margin: 0 3px;
  cursor: pointer;
`;
