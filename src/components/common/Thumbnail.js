import React, { useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { useSpring, animated, config } from "react-spring";

export default function Thumbnail({ selected, value, image }) {
  const [{ background }, set] = useSpring(() => ({
    background: "#353739",
    config: config.stiff,
  }));

  useEffect(() => {
    if (selected === value) set({ background: "#646566" });
    else set({ background: "#353739" });
  }, [selected]);

  return (
    <Container style={{ background }} border={selected === value ? "white" : "#353739"}>
      <Image src={image} onError={handleImageError} />
    </Container>
  );
}

Thumbnail.propTypes = {
  selected: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
};

function handleImageError(e) {
  // Make sure this is a valid file, else this function would be called endlessly
  e.target.src = "./assets/icons/broken_image.svg";
  // console.clear()
}

const Container = styled(animated.div)`
  background: #353739;
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${(props) => props.border};
`;

const Image = styled.img`
  width: 90px;
  height: auto;
`;
