import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

export default function TopButtonContainer(props) {
  return <Container>{props.children}</Container>;
}

TopButtonContainer.propTypes = {
  children: PropTypes.any,
};

const Container = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  /* 410px sidebar + 30px normal gap */
  right: calc(410px + 30px);
  display: flex;
  row-gap: 10px;
  justify-content: space-between;
`;
