import React, { useEffect, useRef, useState } from "react";
import { useSpring, animated, config } from "react-spring";
import styled from "styled-components";
import Title from "./Title";

const defaultStyles = {
  box: {},
  body: {
    marginTop: "1.5em",
    padding: "0 36px",
    textAlign: "left",
  },
  footer: { display: "flex", flexWrap: "wrap", gap: "3em", marginTop: "1em" },
};

const useModal = (title, defaultState = false, styles = {}) => {
  const [isOpen, setIsOpen] = useState(defaultState);
  const containerRef = useRef();
  const [body, setBody] = useState(null);
  const [footer, setFooter] = useState(null);
  const [bindings, setBindings] = useState();

  const [{ scale, opacity }, set] = useSpring(() => ({
    scale: 0,
    opacity: 0,
    config: config.stiff,
  }));

  useEffect(() => {
    if (isOpen) {
      set({ scale: 1, opacity: 1 });
      if (containerRef.current) containerRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyPress = (e) => {
    if (e.keyCode === 27) closeModal();

    if (bindings && e.keyCode in bindings) {
      bindings[e.keyCode]();
    }
  };

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    set({ scale: 0, opacity: 0 });
    setTimeout(() => setIsOpen(false), 300);
  };

  return {
    isOpen,
    openModal,
    closeModal,
    setBody,
    setFooter,
    setBindings,
    component: isOpen ? (
      <Container onKeyDown={handleKeyPress} tabIndex="0" ref={containerRef}>
        <Box
          style={{
            ...defaultStyles.box,
            scale,
            opacity,
            ...(styles.box ?? {}),
          }}
        >
          <div style={{ width: "100%" }}>
            <Title>{title}</Title>
          </div>

          <div style={{ width: "100%" }}>
            <div style={{ ...defaultStyles.body, ...(styles.body ?? {}) }}>{body ?? null}</div>
          </div>

          <div style={{ ...defaultStyles.footer, ...(styles.footer ?? {}) }}>{footer}</div>
        </Box>
      </Container>
    ) : null,
  };
};

const Box = styled(animated.div)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background: #1e2022;
  text-align: center;
  margin: 120px;
  width: 55vw;
  min-height: 65vh;
  max-height: 75vh;
  overflow-y: auto;
  padding: 36px 24px;
  border-radius: 8px;
  box-shadow: 6px 6px 6px 6px rgba(0, 0, 0, 0.5);
  word-break: break-all;
`;

const Container = styled.div`
  display: flex;
  z-index: 100;
  position: fixed;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  outline: none;
`;

export default useModal;
