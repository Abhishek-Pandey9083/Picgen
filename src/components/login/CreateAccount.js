import React from "react";
import styled from "styled-components";

export default function CreateAccount() {
  return (
    <>
      <StepList>
        <Step>
          <Label>
            If you require help or assistance with PicGen, contact
            <Link href={`mailto:${process.env.HELP_EMAIL}`}>{process.env.HELP_EMAIL}</Link>
          </Label>
        </Step>
      </StepList>
    </>
  );
}

const Label = styled.label`
  color: white;
  display: block;
  margin-bottom: 20px;
  font-size: 0.8em;
  height: 100%;
`;

const StepList = styled.ul`
  list-style-type: none;
  padding: 0;
  color: white;
  font-size: 1em;
`;

const Step = styled.li`
  display: flex;
  height: 25px;
  margin-bottom: 15px;
`;

const Link = styled.a`
  color: #91f2fe;
  padding: 0 5px;
`;
