import React, { useContext, useState } from "react";
import styled from "styled-components";
import ScaledButton from "../common/ScaledButton";
import GroupCheckBox from "../common/GroupCheckBox";
import Title from "../common/Title";
import { PAGES, RegisterContext } from "../contexts/RegisterContext";
import { register } from "../../api/registerApi";
import { constructData } from "../common/utils";
import PrivacyPolicyData from "./PrivacyPolicyData";
import TermsAndConditionsData from "./TermsAndConditionsData";

const converter = {
  businessEmail: { key: "email" },
  businessTitle: { key: "title" },
  countryOfResidence: { key: "country" },
  gmContactName: { key: "gm_contactName" },
  gmContactTitle: { key: "gm_contactTitle" },
  gmContactEmail: { key: "gm_contactEmail" },
  market: { key: "market_text" },
  reason: { key: "reason_text" },
  brands: {
    key: "brands",
    transform: (data) => {
      return Object.keys(data)
        .filter((key) => data[key] !== false)
        .join(",");
    },
  },
};

export default function PrivacyPolicyForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { pageData, stepData, brandFormData, registerFormData, privacyFormData } =
    useContext(RegisterContext);
  const [page] = pageData;
  const [step, setStep] = stepData;
  const [formData] = registerFormData;
  const [brandData] = brandFormData;
  const [privacyData, setPrivacyData] = privacyFormData;

  function handleNext() {
    const { market, reason, ...brands } = brandData;

    setLoading(true);

    const data = {
      ...formData,
      brands,
      market,
      reason,
      regType: page === PAGES.INTERNAL ? "internal" : "external",
    };

    if (data.companyName != "Other") {
      data.otherCompanyName = "NA";
    }

    register(constructData(data, converter))
      .then(() => setStep(step + 1))
      .catch(() => {
        setLoading(false);
        setError(
          `An error occurred while processing your request! (you're probably using a duplicate email)`,
        );
      });
  }

  function handleChange(status, group, name) {
    setPrivacyData({
      ...privacyData,
      [name]: status,
    });
  }

  return (
    <>
      <ValidationMessage>{error}</ValidationMessage>
      <Container>
        <div>
          <Title>Privacy Policy Form</Title>

          <Box>
            <PrivacyPolicyData />
          </Box>

          <GroupCheckBox
            label={"Accept Privacy Policy"}
            onChange={handleChange}
            group={[]}
            multipleSelection={false}
            isSelected={privacyData.privacyAccepted}
            name={"privacyAccepted"}
          />
        </div>

        <div>
          <Title>Terms &amp; Conditions</Title>

          <Box>
            <TermsAndConditionsData />
          </Box>

          <GroupCheckBox
            label={"Accept Terms & Conditions"}
            onChange={handleChange}
            group={[]}
            multipleSelection={false}
            isSelected={privacyData.tncAccepted}
            name={"tncAccepted"}
          />
        </div>
      </Container>

      <div
        style={{
          display: "flex",
          margin: "20px",
          columnGap: "3em",
          justifyContent: "center",
        }}
      >
        <ScaledButton action={() => setStep(step - 1)} color="#000" label="Back" />

        <ScaledButton
          action={handleNext}
          label="Confirm"
          disabled={loading || !(privacyData.tncAccepted && privacyData.privacyAccepted)}
        />
      </div>
    </>
  );
}

const Container = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 20px;
`;

const Box = styled.div`
  width: 75%;
  margin-top: 15px;
  padding: 0 10px;
  color: #000;
  display: block;
  height: 300px;
  border: 2px solid #000;
  background-color: #fff;
  border-radius: 10px;
  overflow-y: scroll;
`;

const ValidationMessage = styled.p`
  font-size: 1em;
  color: #ff4747;
  display: block;
  margin-bottom: 5px;
`;
