import React, { memo, useContext } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { useSpring, animated } from "react-spring";
import { SiteContext } from "../contexts/SiteContext";
import logic from "../image/configurationLogic";

function Image({ image, pages, selectedPage, changeSelectedPage, handleImageClick }) {
  const props = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: { duration: 450 },
  });

  const { loadingBar } = useContext(SiteContext);
  const { loading } = loadingBar;

  function calculateNextView(operation) {
    let index = pages.findIndex((page) => page.code === selectedPage.code);

    index = operation === "increment" ? index + 1 : index - 1;

    if (index < 0) index = pages.length - 1;
    if (index > pages.length - 1) index = 0;

    return pages[index];
  }

  function moveCamera(e) {
    if (e.deltaY < 0 && !loading) {
      const { type, code } = calculateNextView("increment");
      changeSelectedPage(type, code);
    }

    if (e.deltaY > 0) {
      const { type, code } = calculateNextView("decrement");
      changeSelectedPage(type, code);
    }
  }

  return (
    <Container
      id="vehicle-image-container"
      style={props}
      src={image}
      onWheel={moveCamera}
      onClick={handleImageClick}
    />
  );
}

function arePropsEqual(prevProps, nextProps) {
  return (
    prevProps.image === nextProps.image &&
    prevProps.isInspecting === nextProps.isInspecting &&
    logic.areArrayOfObjectsEqual(prevProps.pages, nextProps.pages)
  );
}

export default memo(Image, arePropsEqual);

Image.propTypes = {
  image: PropTypes.string.isRequired,
  pages: PropTypes.array.isRequired,
  isInspecting: PropTypes.bool.isRequired,
  selectedPage: PropTypes.object.isRequired,
  changeSelectedPage: PropTypes.func.isRequired,
  handleImageClick: PropTypes.func.isRequired,
};

const Container = styled(animated.img)`
  object-fit: contain;
  width: 100%;
  height: 100%;
  position: absolute;
  text-indent: -10000px;
`;
