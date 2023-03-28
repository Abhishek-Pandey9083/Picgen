import styled from "styled-components";

const Title = styled.span`
  font-size: 1.2em;
  text-transform: uppercase;
  color: ${(props) => props.color ?? "white"};
  line-height: 1.8em;
  font-family: "Overpass-Medium";
`;

export default Title;
