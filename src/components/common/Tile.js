import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { useChain, useSpring, animated } from "react-spring";
import checkIcon from "./assets/icons/icon_check.svg";
import styled from "styled-components";
import ReactTooltip from "react-tooltip";

function Variant({ code, description, hoverText, selectedVariant, changeVariant, image }) {
  const [open, setOpen] = useState();

  const iconRef = useRef();
  const { xIcon } = useSpring({
    ref: iconRef,
    config: { mass: 1, tension: 500, friction: 60 },
    from: { xIcon: -7 },
    to: {
      xIcon: open ? 3 : -7,
    },
  });

  const labelRef = useRef();
  const { xLabel } = useSpring({
    ref: labelRef,
    config: { mass: 1, tension: 500, friction: 60 },
    from: { xLabel: 2 },
    to: {
      xLabel: open ? 5 : 3,
    },
  });

  useChain(open ? [iconRef, labelRef] : [labelRef, iconRef], [0, open ? 0.15 : 0.15]);

  useEffect(() => {
    isVariantSelected() ? setOpen(true) : setOpen(false);
  }, [selectedVariant]);

  function isVariantSelected() {
    if (isObject(code)) {
      return code.Id === selectedVariant;
    } else return code === selectedVariant;
  }

  function isObject(value) {
    return value && typeof value === "object" && value.constructor === Object;
  }

  return (
    <>
      {hoverText && (
        <ReactTooltip id={hoverText} place="bottom" backgroundColor="#222" delayShow={100}>
          {hoverText}
        </ReactTooltip>
      )}

      <Tile data-tip data-for={hoverText} onClick={() => changeVariant(code)} id={code}>
        {image}
        <DescriptionContainer>
          <Description
            style={{
              transform: xIcon.to((v) => `translateX(${v}%)`),
            }}
          >
            <Icon src={checkIcon} />
            <Label
              style={{
                transform: xLabel.to((v) => `translateX(${v}%)`),
                color: open ? "#0072CE" : "#fff",
              }}
            >
              {description}
            </Label>
          </Description>
        </DescriptionContainer>
      </Tile>
    </>
  );
}

Variant.propTypes = {
  code: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  description: PropTypes.string.isRequired,
  selectedVariant: PropTypes.string.isRequired,
  changeVariant: PropTypes.func.isRequired,
  image: PropTypes.object.isRequired,
  hoverText: PropTypes.string,
};

export default Variant;

const Description = styled(animated.div)`
  display: grid;
  grid-template-columns: 13px auto;
  grid-template-areas: "icon description";
`;

const Icon = styled(animated.img)`
  grid-area: icon;
  width: 15px;
  height: 15px;
`;

const DescriptionContainer = styled.div`
  margin-top: 0.35em;
  overflow: hidden;
  width: 100%;
`;

const Label = styled(animated.div)`
  font-family: "Overpass-Regular", serif;
  font-size: 16px;
  grid-area: description;
  width: 95%;
  /* color: #ffffff; */
  transition: color 0.3s ease-in-out;
`;

const Tile = styled.div`
  align-self: center;
  margin-bottom: 20px;
  cursor: pointer;

  &:hover ${Label} {
    color: #39a0f1 !important;
  }
`;
