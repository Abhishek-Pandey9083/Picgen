import React, { useContext } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { animated, useSpring } from "react-spring";
import { SiteContext } from "../contexts/SiteContext";
import icon from "./assets/icons/logout.svg";
import ReactTooltip from "react-tooltip";
import { LS_REMEMBER_STATE, LS_USERKEY } from "../common/enum.js";
import { removeFromStorage } from "../common/utils.js";

export default function LogoutButton() {
  const navigate = useNavigate();

  const { loadingBar, toast } = useContext(SiteContext);
  const [, setLoading] = loadingBar;
  const [, setToastMessage] = toast;

  const [{ scale }, set] = useSpring(() => ({
    scale: 1,
    config: { mass: 1, tension: 300, friction: 20 },
  }));

  return (
    <>
      <Button
        data-tip
        data-for="logoutTip"
        onMouseEnter={() => set({ scale: 1.1 })}
        onMouseLeave={() => set({ scale: 1 })}
        onClick={() => {
          setLoading(false);
          setToastMessage({});
          window.sessionStorage.removeItem(LS_REMEMBER_STATE);
          removeFromStorage({ key: LS_USERKEY });
          navigate("../");
        }}
        style={{ scale }}
      >
        <Icon src={icon} />
      </Button>
      <ReactTooltip id="logoutTip" place="bottom" effect="solid">
        Click here to logout.
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
  width: 65%;
  height: auto;
`;
