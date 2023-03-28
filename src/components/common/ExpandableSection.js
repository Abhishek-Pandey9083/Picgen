import React, { useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { useSpring, animated, config } from "react-spring";

export default function ExpandableSection({ isOpen, name, children, style }) {
  const [{ height }, set] = useSpring(() => ({
    height: "0px",
    config: config.stiff,
  }));

  useEffect(() => {
    if (isOpen) {
      set({
        height: `${document.getElementById(`content-${name}`).clientHeight}px`,
      });
    } else {
      set({ height: `0px` });
    }
  }, [isOpen]);

  return (
    <Container style={{ ...style }}>
      <ContentContainer style={{ height }}>
        <Content id={`content-${name}`}>{children}</Content>
      </ContentContainer>
    </Container>
  );
}

ExpandableSection.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
  children: PropTypes.object.isRequired,
  style: PropTypes.object,
};

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin: 10px 0px;
`;

const ContentContainer = styled(animated.div)`
  width: 100%;
  overflow: hidden;
`;

const Content = styled.div`
  width: 100%;
`;
