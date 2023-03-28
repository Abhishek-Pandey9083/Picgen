import React, { memo } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Page from "./Page";
import logic from "../image/configurationLogic";

function Paginator({ pages, selectedPage, changeSelectedPage }) {
  return (
    <Container>
      {pages.map((page) => {
        return (
          <Page
            key={page.code + page.type}
            value={page.code}
            type={page.type}
            selectedPage={selectedPage}
            changeSelectedPage={changeSelectedPage}
          />
        );
      })}
    </Container>
  );
}

function arePropsEqual(prevProps, nextProps) {
  return (
    prevProps.selectedPage === nextProps.selectedPage &&
    logic.areArrayOfObjectsEqual(prevProps.pages, nextProps.pages)
  );
}

export default memo(Paginator, arePropsEqual);

Paginator.propTypes = {
  pages: PropTypes.array.isRequired,
  selectedPage: PropTypes.object.isRequired,
  changeSelectedPage: PropTypes.func.isRequired,
};

const Container = styled.div`
  height: 20px;
  min-width: 60px;
  background: rgba(0, 0, 0, 0.6);
  position: absolute;
  bottom: 35px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  border-radius: 15px;
  display: flex;
  padding: 0 10px;
  box-sizing: border-box;
  align-items: center;
`;
