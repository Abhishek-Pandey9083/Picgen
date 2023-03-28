import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import ScaledButton from "../common/ScaledButton";
import { RegisterContext, PAGES } from "../contexts/RegisterContext";
import CountryList from "./CountryList.json";

function validateEmail(email) {
  return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email.toLowerCase(),
  );
}

function validateString(str) {
  return typeof str === "string" && str.length >= 3;
}

const column1 = [
  {
    key: "firstName",
    label: "First Name",
  },
  {
    key: "lastName",
    label: "Last Name",
  },
  {
    key: "businessEmail",
    type: "email",
    label: "Business Email",
  },
  {
    key: "businessTitle",
    type: "email",
    label: "Business Title",
  },
  {
    key: "companyName",
    type: "dropdown",
    label: "Company Name",
    options: [
      "Accessible Accessories Ltd.",
      "Agency 720",
      "CDK Global",
      "CM2 Solutions",
      "Commonwealth/McCann",
      "Cossete",
      "Czarnowski ",
      "DCI ArtForm",
      "General Motors",
      "Isobar",
      "Jack Morton Worldwide",
      "Leo Burnett",
      "MacLaren",
      "Maritz",
      "Martin Retail Group ",
      "McCann",
      "MRM",
      "MSL Detroit",
      "One10 Marketing",
      "Publicis",
      "Rightpoint",
      "3DExcite",
      "Other",
    ],
  },
  {
    key: "otherCompanyName",
    label: "Other Company Name",
  },
  {
    key: "countryOfResidence",
    type: "dropdown",
    label: "Country of Residence",
    options: CountryList,
  },
];

const column2 = [
  {
    key: "gmContactName",
    label: "GM Contact Name",
  },
  {
    key: "gmContactTitle",
    label: "GM Contact Title",
  },
  {
    key: "gmContactEmail",
    type: "email",
    label: "GM Contact Business Email",
  },
];

function validateGmEmail(email) {
  if (!validateEmail(email)) return false;
  const validDomains = [
    "gm.com",
    "chevrolet.com",
    "cadillac.com",
    "buickgmc.com",
    "gmfinancial.com",
    "gobrightdrop.com",
    "3ds.com",
  ];
  if (!validDomains.includes(email.split("@")[1].toLowerCase())) return false;
  return true;
}

const internalValidators = {
  firstName: validateString,
  lastName: validateString,
  businessTitle: validateString,
  businessEmail: validateGmEmail,
  companyName: () => true,
  countryOfResidence: () => true,
};

const externalValidators = {
  ...internalValidators,
  businessEmail: validateEmail,
  gmContactName: validateString,
  gmContactTitle: validateString,
  gmContactEmail: validateGmEmail,
};

export default function UserDataForm() {
  const { pageData, stepData, registerFormData, registerFormErrors } = useContext(RegisterContext);
  const [page, setPage] = pageData;
  const [step, setStep] = stepData;
  const [formData, setFormData, validateFormData] = registerFormData;
  const [formDataErrors, setFormDataErrors] = registerFormErrors;
  const [isOtherCompany, setIsOtherCompany] = useState(false);
  const validators = page === PAGES.INTERNAL ? internalValidators : externalValidators;

  useEffect(() => {
    /* force select the options for select inputs / dropdowns only */
    const obj = { ...formData };
    let shouldUpdate = false;
    [...column1, ...column2]
      .filter((input) => input.type === "dropdown")
      .forEach((input) => {
        if (formData[input.key].trim().length === 0 && input.options.length > 0) {
          obj[input.key] = input.options[0];
          shouldUpdate = true;
        }
      });
    if (shouldUpdate) setFormData(obj);
  }, []);

  useEffect(() => {
    if (!isOtherCompany && formData.companyName === "Other") {
      setIsOtherCompany(true);
    }
  }, [formData]);

  function handleChange(e) {
    e.persist();
    if (e.target.id === "companyName") {
      setIsOtherCompany(e.target.value === "Other");
    }

    if (e.target.id in validators) {
      const err = { ...formDataErrors };
      if (validators[e.target.id](e.target.value)) {
        delete err[e.target.id];
      } else {
        err[e.target.id] = "Invalid value!";
      }
      setFormDataErrors(err);
    }

    setFormData((currData) => {
      return {
        ...currData,
        [e.target.id]: e.target.value,
      };
    });
  }

  function handleNext() {
    if (validateFormData(formData, validators)) setStep(step + 1);
  }

  function getInputElement(input) {
    if (input.type === "dropdown") {
      return (
        <SelectInput
          id={input.key}
          value={formData[input.key]}
          onChange={handleChange}
          border={typeof formDataErrors[input.key] === "string" ? "#FF4747" : "#787878"}
          required
        >
          {input.options.map((option, i) => {
            return (
              <option key={i} value={option}>
                {option}
              </option>
            );
          })}
        </SelectInput>
      );
    } else {
      return (
        <TextInput
          type={input.type}
          id={input.key}
          maxLength="64"
          value={formData[input.key]}
          onChange={handleChange}
          border={typeof formDataErrors[input.key] === "string" ? "#FF4747" : "#787878"}
          required
        />
      );
    }
  }

  return (
    <>
      <Form>
        <Column>
          {column1.map((input) => {
            if (input.key === "otherCompanyName" && !isOtherCompany) return null;
            return (
              <Fieldset key={input.key}>
                <Label>{input.label ?? "Label"}</Label>
                {getInputElement(input)}
                <ValidationMessage>{formDataErrors[input.key] ?? null}</ValidationMessage>
              </Fieldset>
            );
          })}
        </Column>

        <Column>
          {page === PAGES.EXTERNAL &&
            column2.map((input) => {
              return (
                <Fieldset key={input.key}>
                  <Label>{input.label ?? "Label"}</Label>
                  <TextInput
                    type={input.type}
                    id={input.key}
                    maxLength="64"
                    value={formData[input.key]}
                    onChange={handleChange}
                    border={typeof formDataErrors[input.key] === "string" ? "#FF4747" : "#787878"}
                    required
                  />
                  <ValidationMessage>{formDataErrors[input.key] ?? null}</ValidationMessage>
                </Fieldset>
              );
            })}
        </Column>
      </Form>

      <div
        style={{
          display: "flex",
          margin: "20px",
          columnGap: "3em",
          justifyContent: "center",
        }}
      >
        <ScaledButton action={() => setPage(PAGES.HOME)} color="#000" label="Back" />

        <ScaledButton action={handleNext} label="Confirm" />
      </div>
    </>
  );
}

const Form = styled.form`
  display: grid;
  grid-template-columns: 30% 30% 30%;
  column-gap: 20px;
  margin: 0 5px;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 10px;
`;

const Label = styled.label`
  color: #fff;
  display: block;
  font-size: 0.9em;
  font-weight: bold;
  text-transform: uppercase;
  line-height: 1.8em;
`;

const Fieldset = styled.div``;

const TextInput = styled.input`
  width: 90%;
  background: #494a4b;
  color: #fff;
  border: 2px solid ${(props) => props.border};
  height: 30px;
  border-radius: 2px;
  font-size: 1.2em;
  text-indent: 15px;

  &:focus {
    background: rgba(0, 0, 0, 0.1);
  }
`;

const SelectInput = styled.select`
  width: 90%;
  background: #494a4b;
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
