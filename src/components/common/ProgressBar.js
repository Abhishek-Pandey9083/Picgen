import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

export default function ProgressBar({ val, max, bg = "#05C3DD" }) {
  return <Progress bg={bg} value={val} max={max} />;
}

ProgressBar.propTypes = {
  val: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  bg: PropTypes.string,
};

const Progress = styled.progress`
  /* Reset the default appearance */
  -webkit-appearance: none;
  appearance: none;

  width: 100%;
  height: 5px;
  border-radius: 2px;

  ::-webkit-progress-bar {
    border-radius: 5px;
    height: 5px;
    background-color: #eee;
  }

  ::-webkit-progress-value {
    height: 5px;
    border-radius: 5px;
    background-color: ${(props) => props.bg};
  }
`;
