import React, { useContext, useEffect } from "react";
import PropTypes from "prop-types";
import { useSpring, animated, config } from "react-spring";
import { SiteContext } from "../contexts/SiteContext";
import ScaledButton from "../common/ScaledButton";
import styled from "styled-components";
import Title from "./Title";

export default function Modal({ name, title, body, submitBtnText }) {
  const { modals } = useContext(SiteContext);

  const [{ scale, opacity }, set] = useSpring(() => ({
    scale: 0,
    opacity: 0,
    config: config.stiff,
  }));

  function closeModal() {
    set({ scale: 0, opacity: 0 });
    setTimeout(() => modals[name].state[1](false), 300);
  }

  useEffect(() => {
    if (modals[name].state[0]) {
      set({ scale: 1, opacity: 1 });
    }
  }, [modals[name].state[0]]);

  function handleSubmit() {
    typeof modals[name].submit[0]?.handle === "function"
      ? modals[name].submit[0].handle(modals[name].localData[0])
      : false;

    closeModal();
  }

  return (
    <Container display={modals[name].state[0] ? "flex" : "none"}>
      <Box style={{ scale, opacity }}>
        <div style={{ width: "100%" }}>
          <Title>{title}</Title>
          <div style={{ marginTop: "1.5em", padding: "0 36px", textAlign: "left" }}>
            {body ?? null}
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "3em" }}>
          <ScaledButton action={closeModal} color="#000" label="Close" />

          {submitBtnText && (
            <ScaledButton action={handleSubmit} label={submitBtnText ?? "Submit"} />
          )}
        </div>
      </Box>
    </Container>
  );
}

Modal.propTypes = {
  name: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  body: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  submitBtnText: PropTypes.string,
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
  display: ${(props) => props.display};
  z-index: 100;
  position: fixed;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
`;
