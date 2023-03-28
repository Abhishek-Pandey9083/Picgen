import React, { useState } from "react";
import styled from "styled-components";
import Toast from "../common/Toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";

export default function Art() {
  const [setShowFirstExternalIcon] = useState(false);

  const [showSecondExternalIcon, setShowSecondExternalIcon] = useState(false);

  function showExternalLinkIcon(linkString, value) {
    if (linkString === "showfirstlink") setShowFirstExternalIcon(value);
    else setShowSecondExternalIcon(value);
  }

  function handleNavigation(url) {
    window.open(url, "_blank").focus();
  }

  return (
    <Container>
      <Toast />
      <Headline>
        <Logo src={"./assets/logo.png"} />
        <HeadingText>
          <Title>PICTURE GENERATOR</Title>
          <Subtitle>This service provides high resolution images of configured vehicles</Subtitle>
        </HeadingText>
      </Headline>

      <Text>
        Please note: Some MY22 vehicles may not yet be available on PicGen. If you are unable to
        locate the assets needed, please contact
        <LinkDecoration
          style={{ textDecoration: "underline", padding: "0 4px" }}
          onClick={() => handleNavigation(`mailto:${process.env.HELP_EMAIL}`)}
        >
          {process.env.HELP_EMAIL}
        </LinkDecoration>
        or visit GM Asset Central (
        <LinkDecoration
          style={{ textDecoration: "underline" }}
          onMouseEnter={() => showExternalLinkIcon("showsecondlink", true)}
          onMouseLeave={() => showExternalLinkIcon("showsecondlink", false)}
          onClick={() => handleNavigation("https://www.gmassetcentral2.com")}
        >
          www.gmassetcentral2.com
          {showSecondExternalIcon && (
            <FontAwesomeIcon style={{ marginLeft: "5px" }} icon={faExternalLinkAlt} />
          )}
        </LinkDecoration>
        ).
      </Text>
    </Container>
  );
}

const Logo = styled.img`
  width: 20%;
  height: 20%;
`;

const HeadingText = styled.div`
  display: flex;
  flex-direction: column;
`;

const LinkDecoration = styled.a`
  color: #91f2fe;
  text-decoration: underline;
  &:hover {
    color: white;
  }
`;

const Container = styled.section`
  grid-area: art;
  background-image: url("./assets/background.webp");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  position: relative;
`;

const Headline = styled.div`
  width: fit-content;
  margin-top: 2%;
  margin-left: 4%;
  color: white;
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 1.8em;
  font-family: "Overpass-Light";
  margin-bottom: 0px;
`;

const Subtitle = styled.h2`
  font-size: 1.2em;
  font-family: "Overpass-Light";
  margin-top: 0%;
`;

const Text = styled.section`
  margin-left: 100px;
  color: white;
  position: absolute;
  margin-bottom: 55px;
  cursor: pointer;
  font-size: 0.9rem;
  bottom: 0px;
`;
