import React, { useEffect, useState, memo } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { useSpring, animated } from "react-spring";
import { useDrag } from "react-use-gesture";

function RangeSlider({ name, minValue, maxValue, value, onChange, valueType = "integer" }) {
  const [rangeWidth, setRangeWidth] = useState(0);
  const [initialPosition, setInitialPosition] = useState(0);

  const [style, set] = useSpring(() => ({
    x: initialPosition,
    scale: 1,
  }));

  useEffect(() => {
    calculateRangeWidth();
    window.addEventListener("resize", handleWindowResize);
  }, []);

  useEffect(() => () => window.removeEventListener("resize", handleWindowResize), []);

  function handleWindowResize() {
    calculateRangeWidth();
  }

  function calculateRangeWidth() {
    const tracker = document.getElementById("tracker").clientWidth;
    const thumb = document.getElementById("thumb").clientWidth;
    setRangeWidth(tracker - thumb);
  }

  useEffect(() => {
    const percentage = (value - minValue) / (maxValue - minValue);
    const position = percentage * rangeWidth;
    setInitialPosition(position);
    set({ x: position, config: { duration: 0 } });
  }, [rangeWidth]);

  const bind = useDrag(({ cancel, direction, down, offset: [x] }) => {
    if (
      (x < -1 * initialPosition && direction[0] < 0) ||
      (x > rangeWidth - initialPosition && direction[0] > 0)
    ) {
      cancel();
    }
    let newPosition = initialPosition + x;
    if (newPosition < 0) newPosition = 0;
    if (newPosition > rangeWidth) newPosition = rangeWidth;
    onChange(name, getPercentageValue(newPosition));
    set({
      x: newPosition,
      scale: down ? 1.2 : 1,
      config: { mass: 1, tension: 400, friction: 30 },
    });
  });

  function getPercentageValue(value) {
    const percentage = value / rangeWidth;
    let total = (maxValue - minValue) * percentage + minValue;
    return percentage === 0
      ? Number(minValue.toFixed(valueType === "integer" ? 0 : 2))
      : Number(total.toFixed(valueType === "integer" ? 0 : 2));
  }

  return (
    <>
      <Tracker id="tracker">
        <Progress
          style={{
            width: style.x.to((v) => `${v + 2}px`),
          }}
        />
        <Thumb {...bind()} style={style} id="thumb" />
      </Tracker>
    </>
  );
}

RangeSlider.propTypes = {
  minValue: PropTypes.number.isRequired,
  maxValue: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  valueType: PropTypes.string,
};

function arePropsEqual(prevProps, nextProps) {
  return prevProps.value === nextProps.value;
}

export default memo(RangeSlider, arePropsEqual);

const Tracker = styled.div`
  height: 5px;
  width: 95%;
  display: flex;
  align-items: center;
  position: relative;
  border-radius: 5.4px;
  background: rgba(255, 255, 255, 0.25);
  box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px inset;
  border: 1px solid rgb(0, 0, 0);
`;

const Progress = styled(animated.div)`
  height: 7px;
  background-color: white;
  position: absolute;
  border-radius: 5.4px;
`;

const Thumb = styled(animated.div)`
  width: 24px;
  height: 12px;
  border-radius: 12px;
  background: rgb(255, 255, 255);
  box-shadow: rgb(0, 0, 0) 0px 0px 8px 2px;
  border: 2px solid rgba(255, 255, 255, 0.6);
  cursor: grab;
`;
