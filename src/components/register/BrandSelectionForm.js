import React, { useContext } from "react";
import styled from "styled-components";
import ScaledButton from "../common/ScaledButton";
import GroupCheckBox from "../common/GroupCheckBox";
import Title from "../common/Title";
import { RegisterContext } from "../contexts/RegisterContext";

export default function BrandSelectionForm() {
  const { stepData, brandFormData, brandFormErrors } = useContext(RegisterContext);
  const [step, setStep] = stepData;
  const [brandData, setBrandData, validateBrandData] = brandFormData;
  const [brandDataErrors] = brandFormErrors;

  const brands = ["GMC", "Buick", "Cadillac", "Chevrolet US", "Chevrolet Global"];

  function handleNext() {
    if (validateBrandData(brands, brandData)) setStep(step + 1);
  }

  function handleChange(status, group, name) {
    setBrandData({
      ...brandData,
      [name]: status,
    });
  }

  function handleTextInput(e) {
    setBrandData({
      ...brandData,
      [e.target.id]: e.target.value,
    });
  }

  function toggleSelectAll() {
    const state = areAllSelected(brandData);
    const tmp = { ...brandData };
    brands.forEach((brand) => (tmp[brand] = !state));
    setBrandData(tmp);
  }

  function areAllSelected(data) {
    return brands.every((brand) => {
      return brand in data && data[brand] === true;
    });
  }

  return (
    <>
      <Form>
        <div>
          <Title>Brand Selection</Title>
          <CheckboxContainer>
            {brands.map((element, index) => {
              return (
                <GroupCheckBox
                  key={index}
                  name={element}
                  label={element}
                  group={[]}
                  onChange={handleChange}
                  multipleSelection={true}
                  isSelected={brandData[element] ?? false}
                  tabIndex={index + 1}
                  disableMargin={true}
                />
              );
            })}

            <GroupCheckBox
              name="Select All"
              label="Select All"
              group={[]}
              onChange={toggleSelectAll}
              multipleSelection={true}
              isSelected={areAllSelected(brandData)}
            />
          </CheckboxContainer>

          <ValidationMessage>{brandDataErrors.checkbox ?? null}</ValidationMessage>
        </div>

        <div>
          <Title>For which markets are you responsible</Title>
          <TextArea
            rows={10}
            id="market"
            onChange={handleTextInput}
            value={brandData.market ?? ""}
          />
          <ValidationMessage>{brandDataErrors.market ?? null}</ValidationMessage>
        </div>

        <div>
          <Title>Reason why you need access to picgen</Title>
          <TextArea
            rows={10}
            id="reason"
            onChange={handleTextInput}
            value={brandData.reason ?? ""}
          />
          <ValidationMessage>{brandDataErrors.reason ?? null}</ValidationMessage>
        </div>
      </Form>

      <div
        style={{
          display: "flex",
          margin: "20px",
          columnGap: "3em",
          justifyContent: "center",
        }}
      >
        <ScaledButton action={() => setStep(step - 1)} color="#000" label="Back" />

        <ScaledButton action={handleNext} label="Confirm" />
      </div>
    </>
  );
}

const Form = styled.form`
  display: grid;
  grid-template-columns: 35% 30% 30%;
  column-gap: 10px;
`;

const CheckboxContainer = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  row-gap: 20px;
`;

const TextArea = styled.textarea`
  width: 90%;
  display: block;
  color: #fff;
  border: 2px solid #fff;
  background: #000;
  border-radius: 15px;
  resize: none;
  font-size: 1.2em;
  text-indent: 15px;
  margin-top: 20px;
`;

const ValidationMessage = styled.p`
  font-size: 0.9em;
  color: #ff4747;
  display: block;
  margin-bottom: 5px;
`;
