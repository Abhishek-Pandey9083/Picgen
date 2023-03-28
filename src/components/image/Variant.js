import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { animated, useSpring, config } from "react-spring";
import Title from "../common/Title";
import Divider from "../common/Divider";
import RadioButton from "../common/RadioButton";
import GroupCheckBox from "../common/GroupCheckBox";
import ExpandablePanel from "../common/ExpandablePanel";
import Tile from "../common/Tile";
import { getSwatchUrl } from "../../api/imageGenApi";

function Variant({
  title,
  variantListByCategory,
  renderScriptName,
  onOptionChange,
  selectedOption,
  reverseMap,
  hiddenOptionList,
  selectedCamera,
}) {
  const props = useSpring({
    x: "0%",
    opacity: 1,
    from: { x: "25%", opacity: 0 },
    config: config.stiff,
  });

  const { activated } = reverseMap;
  const elements = variantListByCategory.elements || [];

  function bifurcateHybridElements(item) {
    if (item.multipleSelection) {
      return item.elements.map((element, index) => {
        return (
          !hiddenOptionList.includes(element.code) &&
          (!element.view || element.view === selectedCamera.type) && (
            <GroupCheckBox
              key={element.code}
              name={element.code}
              label={element.label}
              onChange={onOptionChange}
              multipleSelection={true}
              group={[]}
              isSelected={selectedOption[element.code] || false}
              tabIndex={index + 1}
              hoverText={element.hoverText}
              darkCheck={true}
              bgOnActive="#4AAEEB"
              passivleyActivated={element.code in activated}
            />
          )
        );
      });
    } else {
      return item.elements.map((element, index) => {
        return (
          !hiddenOptionList.includes(element.code) &&
          (!element.view || element.view === selectedCamera.type) && (
            <GroupCheckBox
              key={element.code}
              name={element.code}
              label={element.label}
              onChange={onOptionChange}
              multipleSelection={false}
              group={item.elements}
              isSelected={selectedOption[element.code] || false}
              tabIndex={index + 1}
              hoverText={element.hoverText}
              darkCheck={true}
              bgOnActive="#4AAEEB"
              passivleyActivated={element.code in activated}
            />
          )
        );
      });
    }
  }

  function getHybridElements(item, index) {
    const bifurcatedElements = bifurcateHybridElements(item).filter(
      (element) => typeof element !== "boolean",
    );
    if (bifurcatedElements.length === 0) return null;

    return (
      <div key={item.label} id={item.label}>
        {typeof bifurcatedElements[0] !== "boolean" && (
          <HybridTitle>{"Group " + (index + 1)}</HybridTitle>
        )}
        {bifurcatedElements}
      </div>
    );
  }

  function getHtmlElement(element, index) {
    if (element.type === "group" && !element.hybridSelection) {
      const groupElements = element.groupElements.filter((e) => {
        if (hiddenOptionList.includes(e.code)) return false;
        if ("view" in e && e.view !== selectedCamera.type) return false;
        return true;
      });
      if (groupElements.length === 0) return null;

      return (
        <ExpandablePanel key={element.group} name={element.group} title={element.label}>
          <SectionContainer key={element.group + index}>
            {groupElements.map((item, index) => {
              if (!item.view || item.view === selectedCamera.type) {
                return (
                  !hiddenOptionList.includes(item.code) && (
                    <GroupCheckBox
                      key={item.code}
                      name={item.code}
                      label={item.label}
                      onChange={onOptionChange}
                      multipleSelection={element.multipleSelection}
                      group={element.multipleSelection ? [] : element.groupElements}
                      isSelected={selectedOption[item.code] || false}
                      tabIndex={index + 1}
                      hoverText={item.hoverText}
                      darkCheck={true}
                      bgOnActive="#4AAEEB"
                      passivleyActivated={element.code in activated}
                    />
                  )
                );
              }
              return false;
            })}
          </SectionContainer>
        </ExpandablePanel>
      );
    } else if (element.type === "group" && element.hybridSelection) {
      const arr = [];
      element.groupElements.map((item, index) => {
        const hyrbidElements = getHybridElements(item, index);
        if (hyrbidElements) arr.push(hyrbidElements);
      });

      if (arr.length === 0) return null;

      return (
        <ExpandablePanel key={element.label} name={element.label} title={element.label}>
          <SectionContainer key={element.group + index}>
            {arr.map((hyrbidElements) => hyrbidElements)}
          </SectionContainer>
        </ExpandablePanel>
      );
    }

    if (element.type === "radiobutton") {
      return (
        !hiddenOptionList.includes(element.code) && (
          <RadioButton
            key={element.code}
            label={element.label}
            name={element.code}
            value={element.code}
            hoverText={element?.hoverText}
            selectedValue={selectedOption}
            onChange={onOptionChange}
            passivleyActivated={element.code in activated}
          />
        )
      );
    }
    if (element.type === "swatch") {
      return (
        !hiddenOptionList.includes(element.code) && (
          <Tile
            key={element.code}
            code={element.code}
            description={element.label}
            hoverText={element?.hoverText}
            selectedVariant={selectedOption}
            changeVariant={onOptionChange}
            image={
              <Image
                src={getSwatchUrl(`${renderScriptName}_${element.code}`)}
                alt={`${renderScriptName}_${element.code}`}
                onError={handleImageError}
              />
            }
            tabIndex={index}
          />
        )
      );
    }
  }

  return (
    <Container>
      <Section style={props}>
        <Title>{title}</Title>
        <Divider />

        {elements.map((element, index) => {
          return getHtmlElement(element, index + 1);
        })}
      </Section>
    </Container>
  );
}

export default Variant;
Variant.propTypes = {
  selectedOption: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  renderScriptName: PropTypes.string.isRequired,
  onOptionChange: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  variantListByCategory: PropTypes.object.isRequired,
  reverseMap: PropTypes.object.isRequired,
  hiddenOptionList: PropTypes.array.isRequired,
  selectedCamera: PropTypes.object,
};

function handleImageError(e) {
  // Make sure this is a valid file, else this function would be called endlessly
  e.target.src = "./assets/icons/broken_image.svg";
  e.target.style.width = "4em";
  e.target.style.height = "4em";
  // console.clear();
}

const Container = styled.aside`
  height: 100%;
  grid-area: option;
  overflow-x: hidden;
  overflow-y: auto;
`;

const Section = styled(animated.section)`
  padding: 15% 30px;
  margin-bottom: 15%;
`;

const Image = styled.img`
  width: 100%;
`;

const SectionContainer = styled.div`
  height: 100%;
`;

const HybridTitle = styled.div`
  text-align: center;
  color: #4aaeeb;
`;
