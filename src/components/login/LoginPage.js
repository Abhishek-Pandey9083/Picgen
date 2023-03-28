import React from "react";
import styled from "styled-components";
import Art from "../common/Art";
import Sidebar from "../common/Sidebar";
import Divider from "../common/Divider";
import LoginForm from "./LoginForm";
import CreateAccount from "./CreateAccount";
import Title from "../common/Title";

export default function LoginPage() {
  return (
    <Container>
      <Art />
      <Sidebar>
        <Section>
          <Title>Sign In</Title>
          <Divider />
          <LoginForm />
        </Section>
        <Section>
          <Title>Picgen Help</Title>
          <Divider />
          <CreateAccount />
        </Section>
      </Sidebar>
    </Container>
  );
}

const Container = styled.main`
  height: 100%;
  display: grid;
  grid-template-columns: auto 400px;
  grid-template-areas: "art sidebar";
  overflow: auto;
`;

const Section = styled.section`
  margin-bottom: 15%;
`;
