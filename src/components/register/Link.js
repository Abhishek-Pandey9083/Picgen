import styled from "styled-components";

const Link = styled.a`
  color: ${(props) => (props.darkMode ? "#8CC7F7" : "#0072CE")};
  text-decoration: none;

  &:hover {
    color: ${(props) => (props.darkMode ? "#39A0F1" : "#00439D")};
    text-decoration: underline;
  }
`;

export default Link;
