import React, { useState, useContext } from "react";
import styled from "styled-components";
import { SiteContext } from "../contexts/SiteContext";
import { useSpring, animated, useTransition, config } from "react-spring";
import informationIcon from "./assets/icons/iconInfo.svg";
import closeIcon from "./assets/icons/iconClose.svg";

function Toast() {
  const [showInfo, setShowInfo] = useState(false);

  const { toast } = useContext(SiteContext);
  const [toastMessage, setToastMessage] = toast;

  const show = !isMessageEmpty(toastMessage);

  const [{ height }, set] = useSpring(() => ({
    height: "0%",
    config: config.stiff,
  }));

  const transitions = useTransition(show, {
    from: {
      opacity: 0,
    },
    enter: {
      opacity: 1,
    },
    leave: {
      opacity: 0,
    },
    config: config.slow,
  });

  function isMessageEmpty(message) {
    return Object.entries(message).length === 0;
  }

  const toastType = toastMessage.type || `Warning`;

  return (
    <>
      {transitions((style, item, key) => {
        return (
          item && (
            <Container key={key} style={{ opacity: style.opacity }}>
              <Panel
                onClick={() => {
                  if (!showInfo) {
                    set({ height: "100%" });
                    setShowInfo(true);
                  } else {
                    setToastMessage({});
                  }
                }}
              >
                <TitleContainer>
                  <Header>{`${toastType}:`} </Header>
                  <Detail>{toastMessage.title}</Detail>
                </TitleContainer>
                <IconContainer>
                  <Icon src={showInfo ? closeIcon : informationIcon} />
                </IconContainer>
                <MessageContainer style={{ height }}>
                  <Header>Message: </Header>
                  <Detail>{toastMessage.description}</Detail>
                </MessageContainer>
              </Panel>
            </Container>
          )
        );
      })}
    </>
  );
}

export default Toast;

const Container = styled(animated.div)`
  width: 100%;
  position: absolute;
  top: 30px;
  display: flex;
  justify-content: flex-end;
  cursor: pointer;
  z-index: 5;
`;

const Panel = styled.div`
  width: 538px;
  height: 165px;
  display: grid;
  grid-template-rows: 40px auto;
  grid-template-columns: 95% 5%;
  grid-template-areas:
    "title icon"
    "message message";
  margin-right: 30px;
`;

const TitleContainer = styled.div`
  grid-area: title;
  width: 100%;
  display: flex;
  align-items: center;
  color: #e0ecaf;
  background: #00000075;
  box-sizing: border-box;
  padding-left: 30px;
`;

const Header = styled.span`
  font-family: "Overpass-Bold", serif;

  margin-right: 7px;
`;

const Detail = styled.span`
  font-family: "Overpass-Regular", serif;
`;

const IconContainer = styled.div`
  grid-area: icon;
  width: 100%;
  height: 100%;
  background: #00000075;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Icon = styled.img`
  width: 20px;
  height: 20px;
  margin-right: 5px;
`;

const MessageContainer = styled(animated.div)`
  grid-area: message;
  background: #00000075;
  width: 100%;
  color: white;
  box-sizing: border-box;
  overflow: hidden;
  padding-left: 30px;
`;
