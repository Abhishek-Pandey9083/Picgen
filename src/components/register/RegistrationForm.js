import React, { useContext } from "react";
import Title from "../common/Title";
import styled from "styled-components";
import UserDataForm from "./UserDataForm";
import PrivacyPolicyForm from "./PrivacyPolicyForm";
import BrandSelectionForm from "./BrandSelectionForm";
import { RegisterContext, PAGES } from "../contexts/RegisterContext";
import SuccessfulReg from "./SuccessfulReg";

export default function RegistrationForm() {
  const { stepData, pageData } = useContext(RegisterContext);
  const [step] = stepData;
  const [page] = pageData;

  const stepLabels = [
    "User Data",
    "Brand Selection",
    "Privacy Policy / Terms & Conditions",
    "Success!",
  ];

  return (
    <>
      <Landscape
        src={
          page === PAGES.INTERNAL
            ? "./assets/images/InternalUser_HeaderPic.png"
            : "./assets/images/AgencyUser_HeaderPic.png"
        }
      />

      <Header>
        <StepContainer>
          <StepLabel>
            <Title>{stepLabels[step]}</Title>
          </StepLabel>
          <StepCounter>
            {stepLabels.map((val, i) => {
              return (
                <Circle
                  key={i}
                  isActive={i === step ? true : false}
                  border={i < step ? "#05C3DD" : "#fff"}
                >
                  {i + 1}
                </Circle>
              );
            })}
          </StepCounter>
        </StepContainer>
      </Header>

      <Body>
        {step === 0 && <UserDataForm />}
        {step === 1 && <BrandSelectionForm />}
        {step === 2 && <PrivacyPolicyForm />}
        {step === 3 && <SuccessfulReg />}
      </Body>
    </>
  );
}

const Landscape = styled.img`
  object-fit: fill;
  height: 25vh;
`;

const Header = styled.div`
  margin-top: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Body = styled.div`
  margin: 30px;
  color: #000;
  overflow-y: scroll;
`;

const StepContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  color: #000;
  justify-content: center;
  align-items: center;
  flex: 0 0 auto;
`;

const StepCounter = styled.div`
  display: flex;
  flex-wrap: wrap;
  color: #000;
  justify-content: center;
  align-items: center;
  flex: 0 0 auto;
  column-gap: 3em;
`;

const StepLabel = styled.div`
  text-align: center;
  margin-bottom: 10px;
`;

const Circle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  cursor: pointer;
  border: 4px solid ${(props) => props.border};
  border-radius: 50%;
  color: #fff;
  height: 2.5em;
  width: 2.5em;
  background: ${(props) => (props.isActive ? "#494a4b" : "transparent")};
`;
