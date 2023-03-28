import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

export default function DisplayLayerInfoContainer({ children, action, x, y }) {
  return (
    <Container $x={x} $y={y} onClick={action}>
      {children}
    </Container>
  );
}

export function DisplayLayerInfoContent({ data }) {
  if (typeof window.DOMParser === "undefined") return "DOMParser not supported";

  const parsedXml = new window.DOMParser().parseFromString(data, "text/xml");

  const errorNode = parsedXml.querySelector("parsererror");
  if (errorNode) {
    console.error("Parsing failed", errorNode);
    return "Parsing failed";
  }

  window.temp = parsedXml;

  const [rootElement] = parsedXml.getElementsByTagName("Layers");
  if (!rootElement) return "No layers found!";

  return (
    <>
      <Title color="#000">
        Layers found at co-ordinates:{" "}
        <strong>
          {rootElement.getAttribute("pixelx")}, {rootElement.getAttribute("pixely")}
        </strong>
      </Title>

      <List>
        {[...rootElement.children].map((layer, i) => (
          <li key={i}>{layer.getAttribute("name")}</li>
        ))}
      </List>
    </>
  );
}

DisplayLayerInfoContainer.propTypes = {
  children: PropTypes.node,
  action: PropTypes.func,
  x: PropTypes.number,
  y: PropTypes.number,
};

DisplayLayerInfoContent.propTypes = {
  data: PropTypes.any,
};

const Container = styled.div`
  position: fixed;
  top: ${(props) => props.$y}px;
  left: ${(props) => props.$x}px;
  z-index: 9999;
  color: #000;
  background: #fff;
  padding: 5px 10px;
  border-radius: 4px;
  border: #000 2px solid;
  cursor: grab;
  box-shadow: 2px 1px 3px #000;
`;

const Title = styled.span`
  display: block;
  color: ${(props) => props.color ?? "white"};
  font-family: "Overpass-Medium";
`;

const List = styled.ol`
  margin: 0;
  padding: 0;
  padding-left: 1em;

  li {
    font-weight: bold;
  }
`;
