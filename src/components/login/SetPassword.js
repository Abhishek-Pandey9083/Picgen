import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import ScaledButton from "../common/ScaledButton";
import Title from "../common/Title";
import { Base64 } from "js-base64";
import { resetPassword } from "../../api/loginApi";
import { constructData } from "../common/utils";

const emptyFormdata = {
  password: "",
  confirmPassword: "",
};

const emptyPwdStatus = {
  length: false,
  lowerAlpha: false,
  upperAlpha: false,
  numeric: false,
};

const PAGES = {
  HOME: null,
  SUCCESS: "success",
};

const regex = {
  numeric: /(?=.*\d)/,
  lowerAlpha: /(?=.*[a-z])/,
  upperAlpha: /(?=.*[A-Z])/,
};

const converter = {
  confirmPassword: { key: "repassword" },
};

function verfiyPassword(pwd) {
  return (
    regex.numeric.test(pwd) &&
    regex.lowerAlpha.test(pwd) &&
    regex.upperAlpha.test(pwd) &&
    pwd.length >= 8
  );
}

function decodeStr(str) {
  if (str === null) return null;
  try {
    return Base64.decode(str);
  } catch {
    return null;
  }
}

function getUrlParam(searchString, parameter, isEncoded = false) {
  const search = new URLSearchParams(searchString);
  return isEncoded ? decodeStr(search.get(parameter)) : search.get(parameter);
}

export default function SetPassword() {
  const [page, setPage] = useState(PAGES.HOME);
  const [formData, setFormData] = useState(emptyFormdata);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formDataErrors, setFormDataErrors] = useState({});
  const [pwdStatus, setPwdStatus] = useState(emptyPwdStatus);
  const navigate = useNavigate();

  const name = getUrlParam(window.location.search, "name");
  const token = getUrlParam(window.location.search, "token");
  const username = getUrlParam(window.location.search, "username");

  function handleChange(e) {
    setFormData((currData) => {
      return { ...currData, [e.target.id]: e.target.value };
    });
  }

  useEffect(() => {
    if (!token || token == "") {
      setError("Token missing! Unable to proceed.");
    }
  }, []);

  useEffect(() => {
    const val = formData.password;
    const status = { ...emptyPwdStatus };
    if (val.length >= 8) status.length = true;
    if (regex.numeric.test(val)) status.numeric = true;
    if (regex.lowerAlpha.test(val)) status.lowerAlpha = true;
    if (regex.upperAlpha.test(val)) status.upperAlpha = true;
    setPwdStatus(status);
  }, [formData.password]);

  useEffect(() => {
    const err = { ...formDataErrors };

    if (formData.password === formData.confirmPassword) {
      delete err.confirmPassword;
    } else {
      err.confirmPassword = "Passwords do not match!";
    }
    setFormDataErrors(err);
  }, [formData.password, formData.confirmPassword]);

  async function handleSubmit(e) {
    e.preventDefault();
    const errors = {};

    Object.keys(formData).forEach((key) => {
      if (formData[key].length === 0) {
        errors[key] = "* Required";
      }
    });

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match!";
    }

    if (Object.keys(errors).length > 0) {
      return setFormDataErrors(errors);
    }

    if (!verfiyPassword(formData.password)) {
      return setFormDataErrors({
        password: "Password does not meet requirements!",
      });
    }

    const data = constructData(formData, converter);
    data["token"] = token;
    setLoading(true);

    try {
      const res = await resetPassword(data);
      if (res.message === "invalid token") {
        throw Error("Invalid token!");
      }
      setPage(PAGES.SUCCESS);
    } catch (err) {
      setError(err?.message ?? "Failed to process your request!");
    }
  }

  return (
    <Container>
      <Header>
        <div>
          <PrimaryText>Welcome to PicGen</PrimaryText>
          <Title>{name}</Title>
        </div>
      </Header>

      <Body>
        <Form>
          {page === PAGES.HOME && (
            <div>
              <Title>Please select a password</Title>
              <ValidationMessage>{error}</ValidationMessage>

              <Column>
                <Fieldset>
                  <Label>Username</Label>
                  <TextInput type="text" id="username" maxLength="64" value={username} disabled />
                </Fieldset>

                <Fieldset>
                  <Label>Password</Label>
                  <TextInput
                    type="password"
                    id="password"
                    maxLength="64"
                    value={formData.password}
                    border={
                      typeof formDataErrors.password === "string" &&
                      formDataErrors.password.length > 0
                        ? "#FF4747"
                        : "#787878"
                    }
                    onChange={handleChange}
                  />
                  <ValidationMessage>{formDataErrors.password ?? null}</ValidationMessage>
                </Fieldset>

                <Fieldset>
                  <Label>Password Confirmation</Label>
                  <TextInput
                    type="password"
                    id="confirmPassword"
                    maxLength="64"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    border={
                      typeof formDataErrors.confirmPassword === "string" &&
                      formDataErrors.confirmPassword.length > 0
                        ? "#FF4747"
                        : "#787878"
                    }
                  />
                  <ValidationMessage>{formDataErrors.confirmPassword ?? null}</ValidationMessage>
                </Fieldset>

                <div>
                  <h4 style={{ marginBottom: 0, color: "#fff" }}>Password Requirements:</h4>
                  <ul style={{ marginTop: "5px" }}>
                    <li
                      style={{
                        color: pwdStatus.length ? "greenyellow" : "red",
                      }}
                    >
                      Minimum 8 characters
                    </li>
                    <li
                      style={{
                        color: pwdStatus.upperAlpha ? "greenyellow" : "red",
                      }}
                    >
                      Atleast 1 uppercase character
                    </li>
                    <li
                      style={{
                        color: pwdStatus.lowerAlpha ? "greenyellow" : "red",
                      }}
                    >
                      Atleast 1 lowercase character
                    </li>
                    <li
                      style={{
                        color: pwdStatus.numeric ? "greenyellow" : "red",
                      }}
                    >
                      Atleast 1 numeric character
                    </li>
                  </ul>
                </div>

                <div
                  style={{
                    display: "flex",
                    margin: "0 0 10px 10px",
                    columnGap: "3em",
                  }}
                >
                  <ScaledButton
                    action={handleSubmit}
                    disabled={!token || loading}
                    type="button"
                    label="Confirm"
                  />
                </div>
              </Column>
            </div>
          )}

          {page === PAGES.SUCCESS && (
            <div>
              <Title color="#fff">Your password was successfully set</Title>
              <Para>
                If you want to start with PicGen please press the button below. You will be guided
                to{" "}
                <a style={{ color: "#91f2fe" }} href="https://picgen.com/login">
                  https://picgen.com/login
                </a>
              </Para>

              <Button
                onClick={(e) => {
                  e.preventDefault();
                  navigate("../");
                }}
                type="button"
              >
                Let&apos;s Get Started
              </Button>
            </div>
          )}
        </Form>
      </Body>
    </Container>
  );
}

SetPassword.propTypes = {
  name: PropTypes.string,
  username: PropTypes.string,
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  background: #1e2022;
  flex-direction: column;
`;

const Header = styled.div`
  height: 20vh;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  padding: 0 20px;
  background-image: url("./assets/background.webp");
  background-size: cover;
  background-repeat: no-repeat, no-repeat;
  background-position: center;
`;

const PrimaryText = styled.h1`
  font-family: "Overpass-Medium";
  text-transform: uppercase;
  margin: 0;
`;

const Body = styled.div`
  margin: 30px;
  color: #000;
  overflow-y: scroll;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 40% 40%;
  column-gap: 20px;
  margin: 0 5px;
`;

const Column = styled.div`
  display: flex;
  margin-top: 20px;
  flex-direction: column;
  row-gap: 10px;
`;

const Label = styled.label`
  color: #666666;
  display: block;
  font-size: 0.9em;
  font-weight: bold;
  text-transform: uppercase;
  line-height: 1.8em;
`;

const Fieldset = styled.div``;

const TextInput = styled.input`
  width: 90%;
  background: rgba(0, 0, 0, 0.1);
  color: #fff;
  border: 2px solid ${(props) => props.border};
  height: 30px;
  border-radius: 2px;
  font-size: 1.2em;
  text-indent: 15px;
`;

const ValidationMessage = styled.p`
  font-size: 0.9em;
  color: #ff4747;
  display: block;
  margin: 5px 0;
`;

const Para = styled.p`
  font-family: "Overpass-Medium";
  color: #fff;
`;

const Button = styled.button`
  height: 50px;
  border: none;
  border-radius: 25px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #4aaeeb;
  text-transform: uppercase;
  font-size: 1.1em;
  padding: 3.5px 30px;
  color: white;
  font-family: "Overpass-Medium";
`;
