import React, { useEffect, memo } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import useToggle from "../common/useToggle";
import { useSpring, animated, config } from "react-spring";
import arrow from "./assets/icons/arrow.svg";

function ExpandablePanel({ title, name, children }) {
  const [isOpen, toggleIsOpen] = useToggle(false);

  const [{ height, background, color }, set] = useSpring(() => ({
    height: "0px",
    color: "#717171",
    background: "black",
    config: config.stiff,
  }));

  const hasContent = children.props.children.length > 0;

  function openPanel() {
    return {
      height: `${document.getElementById(`content-${name}`).clientHeight}px`,
      color: "white",
      background: "#404040",
    };
  }

  useEffect(() => {
    if (isOpen && hasContent) {
      set(openPanel());
    }
  });

  useEffect(() => {
    if (isOpen && hasContent) {
      set(openPanel());
    } else {
      set({ height: `0px`, color: "#717171", background: "black" });
    }
  }, [isOpen]);

  return (
    <Container>
      <Header onClick={toggleIsOpen} style={{ background, color }}>
        <Icon src={arrow} brightness={isOpen ? "100%" : "50%"} rotate={isOpen ? 90 : 0} />
        <Label>{title}</Label>
      </Header>
      <ContentContainer style={{ height }}>
        <Content id={`content-${name}`}>{children}</Content>
      </ContentContainer>
    </Container>
  );
}

function arePropsEqual(prevProps, nextProps) {
  return prevProps.title === nextProps.title && prevProps.children === nextProps.children;
}

export default memo(ExpandablePanel, arePropsEqual);

ExpandablePanel.propTypes = {
  title: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  children: PropTypes.object.isRequired,
};

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin: 10px 0px;
`;

const Header = styled(animated.div)`
  width: 100%;
  height: 40px;
  background: #000000;
  display: flex;
  align-items: center;
  padding: 10px;
  box-sizing: border-box;
  cursor: pointer;
  font-family: "Overpass-Medium";
`;

const Icon = styled(animated.img)`
  width: 9px;
  height: 14px;
  margin-right: 10px;
  filter: brightness(${(props) => props.brightness});
  transform: rotate(${(props) => props.rotate}deg);
  transition: transform 0.3s ease-in-out;
`;

const Label = styled.div`
  padding-top: 3px;
  color: #fff;
`;

const ContentContainer = styled(animated.div)`
  width: 100%;
  overflow: hidden;
  margin-top: 2px;
  background: #333333;
`;

const Content = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 10px 15px;
`;
