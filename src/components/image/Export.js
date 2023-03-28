import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { animated, useTransition, config } from "react-spring";
import Title from "../common/Title";
import Divider from "../common/Divider";
import ValuePicker from "../common/ValuePicker";
import RadioButton from "../common/RadioButton";
import CheckBox from "../common/CheckBox";
import ExpandableSection from "../common/ExpandableSection";
import RangeSlider from "../common/RangeSlider";
import GroupRadioButton from "../common/GroupRadioButton";

const ratio = 1920 / 1080;
const resolutions = [
  { width: 1920, height: 1080 },
  { width: 6000, height: 3376 },
];

export default function Export({
  show,
  settings,
  changeSettings,
  exportSettings,
  changeExportSettings,
}) {
  function handleResolutionChange(val, group, name) {
    changeSettings("width", name.width);
    changeSettings("height", name.height);
  }
  const transitions = useTransition(show, {
    from: {
      opacity: 0,
      x: "10%",
    },
    enter: {
      opacity: 1,
      x: "0%",
    },
    leave: {
      opacity: 0,
    },
    config: config.stiff,
  });

  const showFormatQuality = settings.format === "jpg";
  function handleSizeChange(name, value) {
    let height, width;
    if (name == "width") {
      width = value;
      height = value / ratio;
    } else {
      height = value;
      width = value * ratio;
    }
    changeSettings("width", Math.ceil(width));
    changeSettings("height", Math.ceil(height));
  }
  return (
    <>
      {transitions((style, item, key) => {
        return (
          item && (
            <Container key={key} style={{ opacity: style.opacity }}>
              <Content style={{ x: style.x }}>
                <Section>
                  <Title>{"Image Size"}</Title>
                  <Divider />

                  {resolutions.map((res, i) => {
                    return (
                      <GroupRadioButton
                        key={i}
                        name={res}
                        label={`${res.width}x${res.height}`}
                        onChange={handleResolutionChange}
                        multipleSelection={false}
                        group={resolutions}
                        isSelected={settings.width === res.width && settings.height === res.height}
                        tabIndex={i + 1}
                      />
                    );
                  })}

                  <ValuePicker
                    name={"width"}
                    label={"Image width:"}
                    value={settings.width}
                    format={"px"}
                    changeValue={handleSizeChange}
                    maxLength={4}
                    tabIndex={1}
                  />
                  <ValuePicker
                    name={"height"}
                    label={"Image height:"}
                    value={settings.height}
                    format={"px"}
                    changeValue={handleSizeChange}
                    maxLength={4}
                    tabIndex={2}
                  />
                  {/* <ValuePicker
                    name={"resolution"}
                    label={"Resolution:"}
                    value={settings.resolution}
                    format={"dpi"}
                    changeValue={handleSizeChange}
                    maxLength={3}
                    tabIndex={3}
                  /> */}
                </Section>

                <Title>{"Image Format"}</Title>
                <Divider />
                <RadioButton
                  label={"png"}
                  name={"png"}
                  value={"png"}
                  selectedValue={settings.format}
                  onChange={() => changeSettings("format", "png")}
                />
                <RadioButton
                  label={"jpg"}
                  name={"jpg"}
                  value={"jpg"}
                  selectedValue={settings.format}
                  onChange={() => changeSettings("format", "jpg")}
                />
                <RadioButton
                  label={"tiff"}
                  name={"tiff"}
                  value={"tiff"}
                  selectedValue={settings.format}
                  onChange={() => changeSettings("format", "tiff")}
                />
                <ExpandableSection isOpen={showFormatQuality} name={"quality"}>
                  <QualityContainer>
                    <Label>
                      JPG quality: &nbsp;<strong>{settings.quality} %</strong>
                    </Label>
                    <Label>(Increasing quality reduces image compression)</Label>
                    <RangeSlider
                      name="quality"
                      minValue={0}
                      maxValue={100}
                      value={settings.quality}
                      onChange={changeSettings}
                    />
                  </QualityContainer>
                </ExpandableSection>
                <Title>{"Batch Export"}</Title>
                <Divider />
                <Label>{`Allows you to output large groups of assets in batches:`}</Label>
                <CheckBox
                  label={"All exterior cameras"}
                  onChange={() =>
                    changeExportSettings("allExteriorCameras", !exportSettings.allExteriorCameras)
                  }
                  isSelected={exportSettings.allExteriorCameras}
                  name={"exterior"}
                />
                <CheckBox
                  label={"All interior cameras"}
                  onChange={() =>
                    changeExportSettings("allInteriorCameras", !exportSettings.allInteriorCameras)
                  }
                  isSelected={exportSettings.allInteriorCameras}
                  name={"interior"}
                />
                <CheckBox
                  label={"All colors"}
                  onChange={() => changeExportSettings("allColors", !exportSettings.allColors)}
                  isSelected={exportSettings.allColors}
                  name={"colors"}
                />
                <CheckBox
                  label={"All trims"}
                  onChange={() => changeExportSettings("allTrims", !exportSettings.allTrims)}
                  isSelected={exportSettings.allTrims}
                  name={"trims"}
                />
                <CheckBox
                  label={"All body styles"}
                  onChange={() =>
                    changeExportSettings("allBodyStyles", !exportSettings.allBodyStyles)
                  }
                  isSelected={exportSettings.allBodyStyles}
                  name={"bodystyles"}
                />
                <CheckBox
                  label={"All drivetrains"}
                  onChange={() =>
                    changeExportSettings("allDriveTrains", !exportSettings.allDriveTrains)
                  }
                  isSelected={exportSettings.allDriveTrains}
                  name={"drivetrains"}
                />
                <CheckBox
                  label={"All Color Themes"}
                  onChange={() =>
                    changeExportSettings("allColorThemes", !exportSettings.allColorThemes)
                  }
                  isSelected={exportSettings.allColorThemes}
                  name={"themes"}
                />
              </Content>
            </Container>
          )
        );
      })}
    </>
  );
}

Export.propTypes = {
  show: PropTypes.bool.isRequired,
  settings: PropTypes.object.isRequired,
  changeSettings: PropTypes.func.isRequired,
  exportSettings: PropTypes.object.isRequired,
  changeExportSettings: PropTypes.func.isRequired,
};

const Container = styled(animated.div)`
  height: calc(100% - 70px);
  width: 410px;
  background: #1e2022;
  right: 0;
  position: absolute;
  overflow-y: auto;
  overflow-x: hidden;
`;

const Content = styled(animated.section)`
  padding: 15% 30px;
`;

const Section = styled.div`
  margin-bottom: 15%;
`;

const Label = styled.span`
  width: 100%;
  display: flex;
  align-items: center;
  font-size: 0.95em;
  color: #fff;
  margin-bottom: 10px;
`;

const QualityContainer = styled.div`
  width: 100%;
  height: 100px;
  box-sizing: border-box;
  padding: 10px 0;
`;
