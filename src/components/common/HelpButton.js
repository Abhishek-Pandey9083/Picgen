import React from "react";
import styled from "styled-components";
import { animated, useSpring } from "react-spring";
import helpIcon from "./assets/icons/help.svg";
import ReactTooltip from "react-tooltip";

export default function HelpButton() {
  const [{ scale }, set] = useSpring(() => ({
    scale: 1,
    config: { mass: 1, tension: 300, friction: 20 },
  }));

  return (
    <>
      <a href={`mailto:${process.env.HELP_EMAIL}`}>
        <Button
          data-tip
          data-for="helpTip"
          onMouseEnter={() => set({ scale: 1.1 })}
          onMouseLeave={() => set({ scale: 1 })}
          onClick={() => {}}
          style={{ scale }}
        >
          <Icon src={helpIcon} />
        </Button>
      </a>
      <ReactTooltip id="helpTip" place="bottom" effect="solid">
        Contact PicGen Help
      </ReactTooltip>
    </>
  );
}

const Button = styled(animated.button)`
  background: rgba(0, 0, 0, 0.8);
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 30px;
  cursor: pointer;
  z-index: 5;
`;

const Icon = styled.img`
  width: 1em;
  height: auto;
`;
