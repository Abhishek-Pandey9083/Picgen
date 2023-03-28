import React, { useEffect, useState, useContext } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { authenticate } from "../../api/loginApi";
import { requestResetPassword } from "../../api/brandDetails";
import { Base64 } from "js-base64";
import Cookies from "js-cookie";
import ScaledButton from "../common/ScaledButton";
import { SiteContext } from "../contexts/SiteContext";
import iconAlert from "./assets/iconAlert.svg";
import iconHelp from "./assets/iconHelp.svg";
import { LS_REMEMBER_STATE } from "../common/enum.js";

export default function LoginForm() {
  const [login, setLogin] = useState(emptyLogin);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [touched, setTouched] = useState({});
  const [loginError, setLoginError] = useState("");
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  const errors = getErrors(login);
  const isValid = Object.keys(errors).length === 0;

  const { loadingBar, toast, globalSelection, currentUser } = useContext(SiteContext);
  const [, setUser] = currentUser;
  const [loading, setLoading] = loadingBar;
  const [, setToastMessage] = toast;
  const [, setSelection] = globalSelection;

  const navigate = useNavigate();

  useEffect(() => {
    document.getElementById("username").focus();
    setLoading(false);
    resetLocalStorage();
    Cookies.remove(`picgen`);
  }, []);

  function handleBlur(event) {
    event.persist();
    setTouched((cur) => {
      return { ...cur, [event.target.id]: true };
    });
  }

  function handleChange(e) {
    e.persist();
    setLogin((curLogin) => {
      return {
        ...curLogin,
        [e.target.id]: e.target.value,
      };
    });
  }

  async function handleLogin(event) {
    event.preventDefault();
    resetLoginError();
    setStatus(STATUS.SUBMITTING);
    if (isValid) {
      try {
        setLoading(true);
        const loggedUser = await authenticate(login);
        setUser(loggedUser.user);
        setCookie(loggedUser.token);
        setStatus(STATUS.COMPLETED);

        navigate("./selection");
      } catch (error) {
        if (error === 400) {
          setLoginError("Invalid username or password.");
        } else {
          setToastMessage({
            title: "Authentication service not available!",
            description: "An error occurred authenticating the user",
          });
        }
      } finally {
        setLoading(false);
      }
    } else {
      setStatus(STATUS.SUBMITTED);
    }
  }

  function setCookie(token) {
    const in30Minutes = 1 / 48;
    Cookies.set(`picgen`, token, {
      expires: in30Minutes,
    });
  }

  function getErrors(login) {
    const result = {};
    if (!login.username) result.username = "Username is required";
    if (!login.password) result.password = "Password is required";
    return result;
  }

  function resetLoginError() {
    setLoginError("");
    setShowMoreInfo(false);
  }

  function resetLocalStorage() {
    if (window.sessionStorage.getItem(LS_REMEMBER_STATE) === "true") return;

    setSelection((curSelection) => {
      return {
        ...curSelection,
        agreedLicense: false,
        year: "",
        brandName: "",
        modelName: "",
        brandData: [],
        subModel: [],
        modelId: "",
      };
    });
  }

  async function handlePasswordResetRequest() {
    try {
      if (login.username != "") {
        await requestResetPassword(Base64.encode(login.username));
        setToastMessage({
          type: "Information",
          title: "Password reset request",
          description: "A mail with the change password link has been sent to your account",
        });
      } else {
        setToastMessage({
          type: "Warning",
          title: "Please enter Username",
          description: "Enter Username to request a password reset",
        });
      }
    } catch (e) {
      setToastMessage({
        title: "Unable to request password reset",
        description: "An error occured requesting the password reset",
      });
    }
  }

  const usernameError = (touched.username || status === STATUS.SUBMITTED) && errors.username;
  const passwordError = (touched.password || status === STATUS.SUBMITTED) && errors.password;

  return (
    <Form>
      <Fieldset>
        <Label>Username</Label>
        <TextInput
          type="text"
          id="username"
          maxLength="128"
          value={login.username}
          onBlur={handleBlur}
          onChange={handleChange}
          border={usernameError ? "#FF4747" : "#787878"}
        />
        <ValidationMessage>{usernameError}</ValidationMessage>
      </Fieldset>
      <Fieldset>
        <Label>Password</Label>
        <TextInput
          type="password"
          id="password"
          maxLength="128"
          value={login.password}
          onBlur={handleBlur}
          onChange={handleChange}
          border={passwordError ? "#FF4747" : "#787878"}
        />
        <ValidationMessage>{passwordError}</ValidationMessage>
      </Fieldset>
      <Navigation>
        <ErrorContainer>
          {loginError && <Icon src={showMoreInfo ? iconAlert : iconHelp} />}
          {!showMoreInfo && (
            <ErrorMessage onClick={() => setShowMoreInfo(true)}>{loginError}</ErrorMessage>
          )}
          {loginError && showMoreInfo && (
            <MoreInformation onClick={() => setShowMoreInfo(false)}>
              If you forgot your username or password please contact your IT support.
            </MoreInformation>
          )}
        </ErrorContainer>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <ScaledButton
            color="rgb(141, 127, 85)"
            action={() => navigate("./register")}
            type="button"
            label="Register"
          />
          <ScaledButton action={handleLogin} label={loading ? "Logging..." : "Login"} />
        </div>
      </Navigation>
      <LinkContainer>
        <Link onClick={handlePasswordResetRequest}>I Forgot My Password</Link>
      </LinkContainer>
    </Form>
  );
}

const STATUS = {
  IDLE: "IDLE",
  SUBMITTED: "SUBMITTED",
  SUBMITTING: "SUBMITTING",
  COMPLETED: "COMPLETED",
};

const emptyLogin = {
  username: "",
  password: "",
  // Salt: "",
};

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Icon = styled.img`
  height: 20px;
  width: 20px;
  margin-right: 5px;
  flex-shrink: 0;
`;

const Label = styled.label`
  color: #fff;
  display: block;
  line-height: 2em;
`;

const LinkContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
`;

const Link = styled.a`
  color: #4aaeeb;
  font-size: 0.9em;
  text-decoration: underline;
  cursor: pointer;
`;

const ValidationMessage = styled.p`
  font-size: 0.9em;
  width: 345px;
  color: #ff4747;
  display: block;
  margin: 5px 0;
  position: absolute;
  display: flex;
`;

const ErrorContainer = styled.div`
  width: 180px;
  display: flex;
  height: auto;
`;

const ErrorMessage = styled.span`
  font-size: 0.8em;
  color: #ff4747;
  cursor: pointer;
  &:hover {
    color: #7e7f7f;
  }
`;

const MoreInformation = styled.span`
  display: flex;
  font-size: 0.8em;
  color: #7e7f7f;
  cursor: pointer;
`;

const Fieldset = styled.div`
  margin-bottom: 10%;
  position: relative;
`;

const TextInput = styled.input`
  width: 100%;
  background: #161819;
  color: #787878;
  border: 2px solid ${(props) => props.border};
  height: 50px;
  border-radius: 10px;
  font-size: 1.3em;
  text-indent: 20px;
`;

const Navigation = styled.div`
  // height: 70px;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  align-items: center;
`;
