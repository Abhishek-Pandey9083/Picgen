import React, { useState, createContext } from "react";
import PropTypes from "prop-types";

export const RegisterContext = createContext();

export const PAGES = {
  HOME: null,
  EXTERNAL: "external",
  INTERNAL: "internal",
};

export const emptyUserDataForm = {
  firstName: "",
  lastName: "",
  businessEmail: "",
  businessTitle: "",
  companyName: "",
  otherCompanyName: "",
  countryOfResidence: "",
  gmContactName: "",
  gmContactTitle: "",
  gmContactEmail: "",
};

const emptyBrandData = {
  market: "",
  reason: "",
};

const emptyPrivacyData = {
  privacyAccepted: false,
  tncAccepted: false,
};

export const RegisterProvider = (props) => {
  const [page, setPage] = useState(PAGES.HOME);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(emptyUserDataForm);
  const [formDataErrors, setFormDataErrors] = useState({});
  const [brandData, setBrandData] = useState(emptyBrandData);
  const [brandDataErrors, setBrandDataErrors] = useState({});
  const [privacyData, setPrivacyData] = useState(emptyPrivacyData);

  function validateFormData(formData, validators) {
    let errors = {};
    Object.keys(validators).forEach((key) => {
      if (key === "companyName" && formData[key] === "Other") {
        if (formData["otherCompanyName"].trim().length === 0) {
          errors["otherCompanyName"] = "Please enter your company name";
        }
      } else if (formData[key].trim().length === 0) {
        errors[key] = "* Required";
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormDataErrors(errors);
      return false;
    }

    errors = {};
    Object.keys(validators).forEach((key) => {
      if (!validators[key](formData[key])) {
        errors[key] = "Invalid value!";
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormDataErrors(errors);
      return false;
    }

    setFormDataErrors({});
    return true;
  }

  function validateBrandData(brands, brandFormData) {
    const errors = {};
    if (
      !brands.some((brand) => {
        if (brand in brandFormData && brandFormData[brand] === true) return true;
        return false;
      })
    ) {
      errors["checkbox"] = "Atleast one option is required!";
    }

    const keys = ["market", "reason"];
    keys.forEach((key) => {
      if (key in brandFormData && brandFormData[key].trim().length === 0) {
        errors[key] = "* Required";
      }
    });

    setBrandDataErrors(errors);
    return Object.keys(errors).length === 0;
  }

  return (
    <RegisterContext.Provider
      value={{
        pageData: [page, setPage],
        stepData: [step, setStep],
        registerFormData: [formData, setFormData, validateFormData],
        registerFormErrors: [formDataErrors, setFormDataErrors],
        brandFormData: [brandData, setBrandData, validateBrandData],
        brandFormErrors: [brandDataErrors, setBrandDataErrors],
        privacyFormData: [privacyData, setPrivacyData],
      }}
    >
      {props.children}
    </RegisterContext.Provider>
  );
};

RegisterProvider.propTypes = {
  children: PropTypes.any,
};
