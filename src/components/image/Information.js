import React, { useState } from "react";
import PropTypes from "prop-types";
import { animated } from "react-spring";
import styled from "styled-components";
import ExpandableSection from "../common/ExpandableSection";
import arrow from "../common/assets/icons/arrow.svg";
import { CATEGORIES, CUSTOM_TITLE } from "../common/enum";

function prependZero(num) {
  if (num <= 9) return "0" + num.toString();
  return num;
}

function findElement(variants, code) {
  const correctElement = variants
    .filter(
      (variant) => variant.category != CATEGORIES.DATE && variant.category !== CATEGORIES.DEFAULT,
    )
    .map((variant) => variant.elements)
    .flat()
    .map((element) => {
      return getFinalObjects(element);
    })
    .flat()
    .filter((element) => {
      return element.code === code;
    });
  return correctElement;
}

function getFinalObjects(element) {
  if (element.type === "group" && !element.hybridSelection) return element.groupElements;
  else if (element.hybridSelection)
    return element.groupElements.map((group) => group.elements).flat();
  else return element;
}

function getVariantsByCategory(variants, category) {
  return variants ? variants.find((variant) => variant.category === category) : {};
}

const displayCategories = [
  CATEGORIES.MARKET,
  CATEGORIES.PEG,
  CATEGORIES.DRIVETRAIN,
  CATEGORIES.BODYSTYLE,
  CATEGORIES.COLOR,
  CATEGORIES.LEATHER,
  CATEGORIES.WHEELS,
];

export default function Information({
  brandName,
  year,
  modelName,
  variants,
  subModelName,
  correctAsOfDate,
  selectedOptions,
}) {
  let extraData = {};
  let additionalInfo = "";
  let allAccessories, selectedAccessories;
  let formattedDate = "";

  if (correctAsOfDate) {
    const tmp = new Date(correctAsOfDate);
    formattedDate = `${prependZero(tmp.getMonth() + 1)}/${prependZero(
      tmp.getDate(),
    )}/${tmp.getFullYear()}`;
  }

  if (variants && selectedOptions) {
    additionalInfo = `${selectedOptions[CATEGORIES.MMC]} ${selectedOptions[CATEGORIES.MARKET]} ${
      selectedOptions[CATEGORIES.PEG]
    }`;

    allAccessories = getVariantsByCategory(variants, CATEGORIES.ACCESORIES);

    displayCategories.forEach((cat) => {
      const e = findElement(variants, selectedOptions[cat])[0];
      if (!e) return;
      extraData[CUSTOM_TITLE[cat] ?? cat] = [`${e.label ?? ""} (${selectedOptions[cat]})`];
    });

    if (CATEGORIES.ACCESORIES in selectedOptions)
      selectedAccessories = selectedOptions[CATEGORIES.ACCESORIES];
  }

  if (selectedAccessories && Object.values(selectedAccessories).includes(true)) {
    Object.keys(selectedAccessories).forEach((code) => {
      if (selectedAccessories[code] === false) return;
      for (let i = 0; i < allAccessories.elements.length; i++) {
        const currGroup = allAccessories.elements[i];
        const groupElement = (
          currGroup.hybridSelection
            ? currGroup.groupElements.map((hybrid) => hybrid.elements).flat()
            : currGroup.groupElements
        ).find((element) => element.code === code);

        if (groupElement) {
          const str = `${groupElement.label} (${groupElement.code})`;
          return currGroup.label in extraData
            ? extraData[currGroup.label].push(str)
            : (extraData[currGroup.label] = [str]);
        }
      }
    });
  }

  const [showAll, setShowAll] = useState(false);

  return (
    <Container>
      <HoverBox>
        <PaddingBox
          style={{
            display: "flex",
            justifyContent: "space-between",
            columnGap: "2rem",
          }}
          onClick={() => setShowAll(!showAll)}
        >
          <Title>Vehicle Summary</Title>
          <Icon src={arrow} rotate={showAll ? 90 : -90} />
        </PaddingBox>
      </HoverBox>

      <PaddingBox>
        <Label>{`${brandName} - ${year}`}</Label>
        <Label>{`Product Correct as of - ${formattedDate}`}</Label>
        <Label>{`${modelName} ${subModelName} - ${additionalInfo}`}</Label>

        <ExpandableSection isOpen={showAll} style={{ margin: 0 }} name="all-packages-accessories">
          <>
            {Object.keys(extraData).map((label) => {
              return (
                <div key={label}>
                  <SecondaryText color="#fff">{`${label}: `}</SecondaryText>
                  <SecondaryText>{extraData[label].join(", ")}</SecondaryText>
                </div>
              );
            })}
          </>
        </ExpandableSection>
      </PaddingBox>
    </Container>
  );
}

Information.propTypes = {
  brandName: PropTypes.string.isRequired,
  year: PropTypes.string.isRequired,
  modelName: PropTypes.string.isRequired,
  subModelName: PropTypes.string.isRequired,
  correctAsOfDate: PropTypes.string.isRequired,
  selectedOptions: PropTypes.object,
  variants: PropTypes.array,
};

const Container = styled.div`
  background: rgba(0, 0, 0, 0.6);
  position: absolute;
  z-index: 1;
  bottom: 0;
  left: 0;
  padding: 0;
  border-radius: 0 6px 0px 0px;
  box-sizing: border-box;
  min-width: 300px;
  max-width: 360px;
`;

const PaddingBox = styled.div`
  padding: 8px;
  max-height: 60vh;
  overflow-y: auto;
`;

const HoverBox = styled.div`
  cursor: pointer;
  transition: background 0.3s ease;
  border-radius: 0 6px 0px 0px;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
`;

const Title = styled.p`
  color: #fff;
  text-transform: uppercase;
  font-size: 16px;
  margin: 0;
`;

const Icon = styled(animated.img)`
  width: 9px;
  height: 14px;
  margin-right: 10px;
  transform: rotate(${(props) => props.rotate}deg);
  transition: transform 0.3s ease-in-out;
`;

const Label = styled.p`
  color: #b5b5b5;
  font-size: 13px;
  margin: 0;
`;

const SecondaryText = styled.span`
  color: ${(props) => props.color || "#b5b5b5"};
  text-transform: capitalize;
  font-size: 13px;
`;
