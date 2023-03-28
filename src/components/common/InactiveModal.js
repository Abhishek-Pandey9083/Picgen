import React, { useEffect, useRef } from "react";
import Cookies from "js-cookie";
import PropTypes from "prop-types";
import styled from "styled-components";
import useModal from "./useModal";
import ScaledButton from "./ScaledButton";
import { useNavigate } from "react-router-dom";
import { LS_REMEMBER_STATE } from "./enum";

let activityInterval;
// Values below are in seconds
const CHECK_INACTIVITY_INTERVAL = 1;
const MAX_INACTIVITY = 15 * 60;

function prependZero(num) {
  if (num <= 9) return "0" + num.toString();
  return num;
}

function formatTimer(time) {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${prependZero(minutes)} : ${prependZero(seconds)}`;
}

function Component({ time }) {
  return (
    <>
      <Div style={{ textTransform: "uppercase", fontSize: "1.3em" }}>Session timeout in</Div>
      <Div style={{ fontSize: "2.5em", fontWeight: "bold", color: "#4AAEEB" }}>
        {formatTimer(time)}
      </Div>
      <br />
      <Div>Would you like to continue?</Div>
    </>
  );
}

export default function InactiveModal() {
  const navigate = useNavigate();
  const inActivityTimer = useRef(0);
  const inactiveModal = useModal(
    "For security purposes and due to a period of inactivity, your session is about to expire",
    false,
  );

  const inactiveModalRef = useRef();

  function customLogout() {
    window.sessionStorage.setItem(LS_REMEMBER_STATE, "true");
    inactiveModal.closeModal();
    Cookies.remove("picgen");
    inActivityTimer.current = 0;
    navigate(`..${process.env.BASENAME}`);
  }

  function resetTimer() {
    const token = Cookies.get("picgen");
    if (inactiveModalRef.current.isOpen || !token || token.trim().length === 0) return;

    inActivityTimer.current = 0;
  }

  inactiveModalRef.current = inactiveModal;

  useEffect(() => {
    inactiveModal.setBody(<Component time={MAX_INACTIVITY} />);

    inactiveModal.setFooter(
      <>
        <ScaledButton action={inactiveModal.closeModal} color="#000" label="No" />
        <ScaledButton action={customLogout} label="Yes" />
      </>,
    );

    window.getInactivityTimer = () => inActivityTimer.current;

    // Add event listeners to reset inactivity timer if activity is detected
    document.addEventListener("click", resetTimer);
    document.addEventListener("wheel", resetTimer);
    document.addEventListener("scroll", resetTimer);
    document.addEventListener("keydown", resetTimer);
    document.addEventListener("mousemove", resetTimer);
    document.addEventListener("mousedown", resetTimer);
    document.addEventListener("touchstart", resetTimer);

    activityInterval = setInterval(() => {
      const token = Cookies.get("picgen");
      if (!token || token.trim().length === 0) {
        inActivityTimer.current = 0;
        return;
      }

      inActivityTimer.current += CHECK_INACTIVITY_INTERVAL;
      inactiveModal.setBody(<Component time={MAX_INACTIVITY - inActivityTimer.current} />);

      // Open modal every 30 seconds if user is inactive
      if (
        inActivityTimer.current >= MAX_INACTIVITY / 2 &&
        inActivityTimer.current % 10 === 0 &&
        !inactiveModalRef.current.isOpen
      ) {
        inactiveModal.openModal();
      }

      if (inActivityTimer.current >= MAX_INACTIVITY) {
        customLogout();
      }
    }, CHECK_INACTIVITY_INTERVAL * 1000);

    return () => {
      // Clear intervals & remove event listeners
      clearInterval(activityInterval);
      document.removeEventListener("click", resetTimer);
      document.removeEventListener("wheel", resetTimer);
      document.removeEventListener("scroll", resetTimer);
      document.removeEventListener("keydown", resetTimer);
      document.removeEventListener("mousemove", resetTimer);
      document.removeEventListener("mousedown", resetTimer);
      document.removeEventListener("touchstart", resetTimer);
    };
  }, []);

  return <>{inactiveModal.component}</>;
}

const Div = styled.div`
  text-align: center;
`;

Component.propTypes = {
  time: PropTypes.number.isRequired,
};
