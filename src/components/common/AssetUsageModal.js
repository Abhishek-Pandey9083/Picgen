import React, { useContext } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import Title from "./Title";
import Divider from "./Divider";
import GroupCheckBox from "./GroupCheckBox";
import { SiteContext } from "../contexts/SiteContext";

export default function AssetUsageModal({ data }) {
  const { currentUser } = useContext(SiteContext);
  const [user] = currentUser;
  const [localData, setLocalData] = data;
  const checkboxData = {
    digital: [
      "Website Jellybeans",
      "Website Features/Hero Shots",
      "Mobile Site/Apps",
      "Display/OLA",
      "Email Marketing",
      "Digital Catalog",
    ],
    print: ["Catalog", "Direct Mail", "Newspaper/Magazine Ad"],
    misc: ["Asset Central/DAM", "Asset Comps/Product Reviews", "Testing"],
  };

  if (user.role !== "admin" || user.isDebug !== 1) checkboxData.misc.pop();

  function handleChange(status, group, name) {
    setLocalData({
      ...localData,
      [name]: status,
    });
  }

  return (
    <>
      <Title>Digital</Title>
      <CheckboxContainer>
        {checkboxData.digital.map((element, index) => {
          return (
            <GroupCheckBox
              key={index}
              name={element}
              label={element}
              onChange={handleChange}
              multipleSelection={true}
              group={[]}
              isSelected={localData[element] ?? false}
              tabIndex={index + 1}
            />
          );
        })}
      </CheckboxContainer>
      <Divider />

      <Title>Print</Title>
      <CheckboxContainer>
        {checkboxData.print.map((element, index) => {
          return (
            <GroupCheckBox
              key={index}
              name={element}
              label={element}
              onChange={handleChange}
              multipleSelection={true}
              group={[]}
              isSelected={localData[element] ?? false}
              tabIndex={index + 1}
            />
          );
        })}
      </CheckboxContainer>
      <Divider />

      <Title>Misc</Title>
      <CheckboxContainer>
        {checkboxData.misc.map((element, index) => {
          return (
            <GroupCheckBox
              key={index}
              name={element}
              label={element}
              onChange={handleChange}
              multipleSelection={true}
              group={[]}
              isSelected={localData[element] ?? false}
              tabIndex={index + 1}
            />
          );
        })}
      </CheckboxContainer>
      <Divider />
    </>
  );
}

AssetUsageModal.propTypes = {
  data: PropTypes.any,
};

const CheckboxContainer = styled.div`
  display: grid;
  grid-template-columns: 33.33% 33.33% 33.33%;
`;
