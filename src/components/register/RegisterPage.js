import React, { useContext } from "react";
import styled from "styled-components";
import RegistrationForm from "./RegistrationForm";
import { RegisterContext, PAGES } from "../contexts/RegisterContext";

const img = {
  agency: {
    active: "./assets/icons/GM_Agency_Users_Active_BTN.png",
    inactive: "./assets/icons/GM_Agency_Users_Inactive_BTN.png",
  },
  employee: {
    active: "./assets/icons/GM_EmployeeContractor_Users_Active_BTN-1.png",
    inactive: "./assets/icons/GM_EmployeeContractor_Users_Inactive_BTN-1.png",
  },
};

export default function RegisterPage() {
  const { pageData, registerFormErrors, brandFormErrors } = useContext(RegisterContext);
  const [page, setPage] = pageData;
  const [, setFormDataErrors] = registerFormErrors;
  const [, setBrandDataErrors] = brandFormErrors;

  return (
    <Container justifyContent={page === PAGES.HOME ? "space-between" : "flex-start"}>
      {page === PAGES.HOME && (
        <>
          <Landscape src="./assets/images/UserSelection_HeaderPic.png" />

          <Box>
            <IconBox
              onClick={() => {
                setFormDataErrors({});
                setBrandDataErrors({});
                setPage(PAGES.INTERNAL);
              }}
              bgImg={img.employee.inactive}
              hoverBg={img.employee.active}
            />
            <IconBox
              onClick={() => {
                setFormDataErrors({});
                setBrandDataErrors({});
                setPage(PAGES.EXTERNAL);
              }}
              bgImg={img.agency.inactive}
              hoverBg={img.agency.active}
            />
          </Box>
        </>
      )}

      {page !== PAGES.HOME && <RegistrationForm />}
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  background: #1e2022;
  flex-direction: column;
  justify-content: ${(props) => props.justifyContent ?? "flex-start"};
`;

const Landscape = styled.img`
  object-fit: fill;
  height: 50vh;
`;

const Box = styled.div`
  display: flex;
  margin: 5em 0;
  justify-content: center;
  align-items: center;
  column-gap: 2em;
`;

const IconBox = styled.div`
  width: 200px;
  height: 200px;
  cursor: pointer;
  background: ${(props) => props.background ?? "transparent"};
  border-radius: 5px;
  background-image: url("${(props) => props.bgImg}");
  background-repeat: no-repeat, no-repeat;
  background-position: center;

  &:hover {
    background: url("${(props) => props.hoverBg}");
  }
`;
