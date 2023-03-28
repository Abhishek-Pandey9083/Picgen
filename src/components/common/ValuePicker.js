import React, { memo } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

function ValuePicker({ name, label, value, format, changeValue, maxLength = 4, tabIndex }) {
  return (
    <Container>
      <Label>{label}</Label>
      <FieldContainer format={format}>
        <Field
          value={value}
          onChange={(e) => changeValue(name, parseInt(e.target.value != "" ? e.target.value : 0))}
          maxLength={maxLength}
          id={`input-${name}`}
          tabIndex={tabIndex}
        />
      </FieldContainer>
      <Control>
        <Button onClick={() => changeValue(name, value + 1)}>+</Button>
        <Button
          onClick={() => {
            if (value > 0) changeValue(name, value - 1);
          }}
        >
          -
        </Button>
      </Control>
    </Container>
  );
}

function arePropsEqual(prevProps, nextProps) {
  return prevProps.value === nextProps.value;
}

export default memo(ValuePicker, arePropsEqual);

ValuePicker.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  format: PropTypes.string.isRequired,
  changeValue: PropTypes.func.isRequired,
  maxLength: PropTypes.number,
  tabIndex: PropTypes.number.isRequired,
};

const Container = styled.div`
  height: 40px;
  width: 100%;
  display: grid;
  grid-template-columns: 110px 90px 55px;
  grid-template-areas: "label field control";
  margin: 25px 0;
`;

const Label = styled.span`
  grid-area: label;
  width: 100%;
  display: flex;
  align-items: center;
  font-size: 0.95em;
  color: #fff;
`;

const FieldContainer = styled.div`
  position: relative;
  float: left;
  color: #737373;
  font-family: "Overpass-Medium";
  font-size: 0.9em;
  &:after {
    position: absolute;
    right: 15px;
    top: 12px;
    content: '${(props) => props.format}';
`;

const Field = styled.input`
  grid-area: field;
  background: #161819;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.9em;
  height: 100%;
  color: #737373;
  font-family: "Overpass-Medium";
  text-indent: 20px;
  border: 1px solid white;
  border-radius: 10px;
`;

const Control = styled.div`
  grid-area: control;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
`;

const Button = styled.button`
  border: 0;
  background: black;
  height: 18px;
  width: 30px;
  cursor: pointer;
  color: white;
  font-family: "Overpass-Medium";
`;
