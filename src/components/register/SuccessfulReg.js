import React from "react";
import { useNavigate } from "react-router-dom";

export default function SuccessfulReg() {
  const navigate = useNavigate();

  return (
    <div style={{ color: "#fff" }}>
      <h2 style={{ color: "lightgreen" }}>Success! Your request was submitted</h2>
      <p>
        Your registration request has been received and submitted for review. You will receive your
        login instructions when your application is approved. Please watch your email inbox for
        further communications from the Picgen team.
        <br />
        Click{" "}
        <span
          onClick={() => navigate(`..${process.env.BASENAME}`)}
          style={{
            color: "#05C3DD",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          here
        </span>{" "}
        to return to the Picgen home page.
      </p>
    </div>
  );
}
